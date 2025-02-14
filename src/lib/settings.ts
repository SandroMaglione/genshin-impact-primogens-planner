import { EventGroup, EventLog } from "@effect/experimental";
import { SqlClient } from "@effect/sql";
import { Array, Effect, Layer, Option, Schema } from "effect";
import { SqlLive } from "./sql";

export class SettingEvents extends EventGroup.empty.add({
  tag: "SettingChange",
  primaryKey: (_) => _.name,
  payload: Schema.Struct({
    name: Schema.String,
    json: Schema.String,
  }),
}) {}

export const SettingsLive = EventLog.group(SettingEvents, (handlers) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    return handlers.handle("SettingChange", ({ payload, conflicts }) =>
      Effect.gen(function* () {
        if (conflicts.length > 0) return;
        yield* sql`INSERT INTO settings ${sql.insert(payload)} ON CONFLICT (name) DO UPDATE SET json = ${payload.json}`;
      }).pipe(Effect.orDie)
    );
  })
).pipe(Layer.provide(SqlLive));

export const SettingsCompactionLive = EventLog.groupCompaction(
  SettingEvents,
  ({ events, write }) =>
    Effect.gen(function* () {
      const last = Array.last(events);
      if (Option.isNone(last)) return;
      yield* write("SettingChange", last.value.payload);
    })
);

export const SettingsReactivityLive = EventLog.groupReactivity(SettingEvents, [
  "settings",
]);
