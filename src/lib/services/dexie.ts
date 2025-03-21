import * as _Dexie from "dexie";
import { Data, Effect, Schema } from "effect";
import {
  EventTable,
  ProgressTable,
  StringFromDate,
  TeamTable,
  type CharacterTable,
  type HistoryTable,
} from "../schema";
import type { TypedFormData, Writeable } from "../types";

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
      progress: _Dexie.EntityTable<
        Writeable<typeof ProgressTable.Encoded>,
        "progressId"
      >;
      event: _Dexie.EntityTable<
        Writeable<typeof EventTable.Encoded>,
        "eventId"
      >;
      history: _Dexie.EntityTable<
        Writeable<typeof HistoryTable.Encoded>,
        "date"
      >;
      character: _Dexie.EntityTable<
        Writeable<typeof CharacterTable.Encoded>,
        "name"
      >;
      team: _Dexie.EntityTable<Writeable<typeof TeamTable.Encoded>, "teamId">;
    };

    db.version(1).stores({
      progress: "++progressId",
      event: "++eventId",
      team: "++teamId",
      history: "date",
      character: "name",
    });

    const formAction =
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

    const changeAction =
      <A, I, T>(
        source: Schema.Schema<A, I>,
        exec: (values: Readonly<A>) => Promise<T>
      ) =>
      (params: I) =>
        Schema.decode(source)(params).pipe(
          Effect.tap(Effect.log),
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

      changeProgress: changeAction(
        Schema.Struct({
          progressId: Schema.Number,
          dailyPrimogems: Schema.optional(
            Schema.compose(Schema.NumberFromString, Schema.Number)
          ),
          fates: Schema.optional(
            Schema.compose(Schema.NumberFromString, Schema.Number)
          ),
          primogems: Schema.optional(
            Schema.compose(Schema.NumberFromString, Schema.Number)
          ),
          genesisCrystals: Schema.optional(
            Schema.compose(Schema.NumberFromString, Schema.Number)
          ),
          fatesGoal: Schema.optional(
            Schema.compose(Schema.NumberFromString, Schema.Number)
          ),
          targetDate: Schema.optional(Schema.String),
        }),
        ({ progressId, ...params }) =>
          db.progress
            .where("progressId")
            .equals(progressId)
            .modify((progress) => {
              if (params.fatesGoal !== undefined) {
                progress.fatesGoal = params.fatesGoal;
              }
              if (params.dailyPrimogems !== undefined) {
                progress.dailyPrimogems = params.dailyPrimogems;
              }
              if (params.fates !== undefined) {
                progress.fates = params.fates;
              }
              if (params.primogems !== undefined) {
                progress.primogems = params.primogems;
              }
              if (params.genesisCrystals !== undefined) {
                progress.genesisCrystals = params.genesisCrystals;
              }
              if (params.targetDate !== undefined) {
                progress.targetDate = params.targetDate;
              }
            })
      ),

      addTeam: changeAction(
        Schema.Struct({
          team: TeamTable.fields.characters,
        }),
        (params) => db.team.add({ characters: params.team })
      ),

      addHistory: formAction(
        Schema.Struct({
          date: Schema.String,
          primogems: Schema.NumberFromString.pipe(Schema.nonNegative()),
        }),
        (params) => db.history.add(params)
      ),

      addEvent: formAction(
        Schema.Struct({
          fates: Schema.NumberFromString,
          primogems: Schema.NumberFromString,
          genesisCrystals: Schema.NumberFromString,
          date: Schema.String,
        }),
        (params) => db.event.add({ ...params, isApplied: true })
      ),

      deleteEvent: changeAction(
        Schema.Struct({ eventId: Schema.Number.pipe(Schema.nonNegative()) }),
        (params) => db.event.where("eventId").equals(params.eventId).delete()
      ),

      deleteTeam: changeAction(
        Schema.Struct({ teamId: Schema.Number.pipe(Schema.nonNegative()) }),
        (params) => db.team.where("teamId").equals(params.teamId).delete()
      ),

      deleteHistory: changeAction(
        Schema.Struct({ date: StringFromDate }),
        (params) => db.history.where("date").equals(params.date).delete()
      ),

      updateHistory: changeAction(
        Schema.Struct({
          date: StringFromDate,
          primogems: Schema.NumberFromString.pipe(Schema.nonNegative()),
        }),
        (params) =>
          db.history.update(params.date, { primogems: params.primogems })
      ),

      toggleEvent: changeAction(
        Schema.Struct({ eventId: Schema.Number, isApplied: Schema.Boolean }),
        ({ eventId, isApplied }) => db.event.update(eventId, { isApplied })
      ),

      toggleCharacter: changeAction(
        Schema.Struct({ name: Schema.String }),
        ({ name }) =>
          db.character.get(name).then((character) => {
            if (character === undefined) {
              db.character.add({ name });
            } else {
              db.character.where("name").equals(name).delete();
            }
          })
      ),
    };
  }),
}) {}
