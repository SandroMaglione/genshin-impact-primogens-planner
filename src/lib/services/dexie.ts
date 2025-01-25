import * as _Dexie from "dexie";
import { Data, Effect, Schema } from "effect";
import { EventTable, ProgressTable } from "../schema";
import type { TypedFormData } from "../types";

class ReadApiError extends Data.TaggedError("ReadApiError")<{
  cause: unknown;
}> {}

class WriteApiError extends Data.TaggedError("WriteApiError")<{
  cause: unknown;
}> {}

const formDataToRecord = (formData: FormData): Record<string, string> => {
  const record: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      record[key] = value;
    }
  }
  return record;
};

export class Dexie extends Effect.Service<Dexie>()("Dexie", {
  accessors: true,
  effect: Effect.gen(function* () {
    const db = new _Dexie.Dexie("genshin-planner") as _Dexie.Dexie & {
      progress: _Dexie.EntityTable<typeof ProgressTable.Encoded, "progressId">;
      event: _Dexie.EntityTable<typeof EventTable.Encoded, "eventId">;
    };

    db.version(1).stores({
      progress: "++progressId",
      event: "++eventId",
    });

    const execute =
      <const R extends string, I, T>(
        source: Schema.Schema<I, Record<R, string>>,
        exec: (values: Readonly<I>) => Promise<T>
      ) =>
      (formData: TypedFormData<R>) =>
        Schema.decodeUnknown(source)(formDataToRecord(formData)).pipe(
          Effect.mapError((error) => new WriteApiError({ cause: error })),
          Effect.flatMap((values) =>
            Effect.tryPromise({
              try: () => exec(values),
              catch: (error) => new WriteApiError({ cause: error }),
            })
          )
        );

    return {
      db,

      progressExists: Effect.tryPromise({
        try: () => db.progress.count(),
        catch: (error) => new ReadApiError({ cause: error }),
      }).pipe(Effect.map((count) => count > 0)),

      initProgress: Effect.tryPromise({
        try: () =>
          db.progress.add({
            dailyPrimogems: 60,
            fates: 0,
            primogems: 0,
            fatesGoal: 90,
          }),
        catch: (error) => new WriteApiError({ cause: error }),
      }),

      updateFatesGoal: execute(
        Schema.Struct({
          progressId: Schema.NumberFromString,
          fatesGoal: Schema.NumberFromString,
        }),
        ({
          progressId,
          fatesGoal,
        }: {
          progressId: number;
          fatesGoal: number;
        }) => db.progress.update(progressId, { fatesGoal })
      ),

      updateProgress: execute(
        Schema.Struct({
          progressId: Schema.NumberFromString,
          dailyPrimogems: Schema.NumberFromString,
          fates: Schema.NumberFromString,
          primogems: Schema.NumberFromString,
        }),
        ({
          progressId,
          ...params
        }: {
          progressId: number;
          dailyPrimogems: number;
          fates: number;
          primogems: number;
        }) =>
          db.progress.update(progressId, {
            fates: params.fates,
            primogems: params.primogems,
            dailyPrimogems: params.dailyPrimogems,
          })
      ),

      addEvent: execute(
        Schema.Struct({
          fates: Schema.NumberFromString,
          primogems: Schema.NumberFromString,
          date: Schema.String,
        }),
        (params: { fates: number; primogems: number; date: string }) =>
          db.event.add({ ...params, isApplied: true })
      ),

      deleteEvent: execute(
        Schema.Struct({
          eventId: Schema.compose(
            Schema.NumberFromString,
            Schema.Number.pipe(Schema.nonNegative())
          ),
        }),
        (params: { eventId: number }) =>
          db.event.where("eventId").equals(params.eventId).delete()
      ),

      toggleEvent: execute(
        Schema.Struct({
          eventId: Schema.NumberFromString,
          isApplied: Schema.String.pipe(
            Schema.transform(Schema.Boolean, {
              decode: (from) => from === "true",
              encode: (to) => to.toString(),
            })
          ),
        }),
        (params: { eventId: number; isApplied: boolean }) =>
          db.event.update(params.eventId, { isApplied: !params.isApplied })
      ),
    };
  }),
}) {}
