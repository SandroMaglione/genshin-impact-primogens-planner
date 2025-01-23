import * as _Dexie from "dexie";
import { Data, Effect, Schema } from "effect";
import { EventTable, ProgressTable } from "../schema";

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
      <I, A, T>(schema: Schema.Schema<A, I>, exec: (values: I) => Promise<T>) =>
      <const R extends string = never>(
        source: Schema.Schema<I, Record<NoInfer<R>, string>>
      ) =>
      (formData: FormData) =>
        Schema.decodeUnknown(source)(formDataToRecord(formData)).pipe(
          Effect.flatMap(Schema.decode(schema)),
          Effect.flatMap(Schema.encode(schema)),
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
            dailyPrimogems: 0,
            fates: 0,
            primogems: 0,
          }),
        catch: (error) => new WriteApiError({ cause: error }),
      }),

      updateProgress: execute(
        Schema.Struct({
          progressId: ProgressTable.fields.progressId,
          dailyPrimogems: ProgressTable.fields.dailyPrimogems,
          fates: ProgressTable.fields.fates,
          primogems: ProgressTable.fields.primogems,
        }),
        ({ progressId, ...params }) =>
          db.progress.update(progressId, {
            fates: params.fates,
            primogems: params.primogems,
            dailyPrimogems: params.dailyPrimogems,
          })
      ),

      addEvent: execute(
        Schema.Struct({
          name: EventTable.fields.name,
          fates: EventTable.fields.fates,
          primogems: EventTable.fields.primogems,
          date: EventTable.fields.date,
        }),
        (params) => db.event.add({ ...params, isApplied: true })
      ),

      deleteEvent: execute(
        Schema.Struct({ eventId: EventTable.fields.eventId }),
        (params) => db.event.where("eventId").equals(params.eventId).delete()
      ),

      toggleEvent: execute(
        Schema.Struct({
          eventId: EventTable.fields.eventId,
          isApplied: EventTable.fields.isApplied,
        }),
        (params) =>
          db.event.update(params.eventId, { isApplied: !params.isApplied })
      ),
    };
  }),
}) {}
