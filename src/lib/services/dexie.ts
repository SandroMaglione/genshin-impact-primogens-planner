import * as _Dexie from "dexie";
import { Data, Effect, Schema } from "effect";
import { ProgressTable } from "../schema";

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
    const db = new _Dexie.Dexie("_db") as _Dexie.Dexie & {
      progress: _Dexie.EntityTable<typeof ProgressTable.Encoded, "progressId">;
    };

    db.version(1).stores({
      activity: "++progressId",
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
      addProgress: execute(
        Schema.Struct({
          dailyPrimogems: ProgressTable.fields.dailyPrimogems,
          fates: ProgressTable.fields.fates,
          primogems: ProgressTable.fields.primogems,
        }),
        (params) => db.progress.add(params)
      ),
      updateProgress: execute(
        Schema.Struct({
          progressId: ProgressTable.fields.progressId,
          dailyPrimogems: Schema.UndefinedOr(
            ProgressTable.fields.dailyPrimogems
          ),
          fates: Schema.UndefinedOr(ProgressTable.fields.fates),
          primogems: Schema.UndefinedOr(ProgressTable.fields.primogems),
        }),
        ({ progressId, ...params }) =>
          db.progress.update(progressId, {
            fates: params.fates,
            primogems: params.primogems,
            dailyPrimogems: params.dailyPrimogems,
          })
      ),
    };
  }),
}) {}
