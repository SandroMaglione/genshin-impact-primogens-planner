import { EventLog, Reactivity } from "@effect/experimental";
import { SqlClient } from "@effect/sql";
import { Array, Effect, Option, Schema, Stream } from "effect";
import { AppEvents } from "./event-log";
import { SqlLive } from "./sql";

class Setting<const Name extends string, S extends Schema.Schema.AnyNoContext> {
  constructor(
    readonly name: Name,
    readonly schema: S
  ) {
    this.json = Schema.parseJson(schema);
    this.encode = Schema.encode(this.json);
    this.encodeSync = Schema.encodeSync(this.json);
    this.decode = Schema.decode(this.json);
  }
  readonly json: Schema.Schema<S["Type"], string, S["Context"]>;
  readonly encode;
  readonly encodeSync;
  readonly decode;
}

export class SettingRepo extends Effect.Service<SettingRepo>()("SettingRepo", {
  dependencies: [Reactivity.layer, SqlLive],
  effect: Effect.gen(function* () {
    const reactivity = yield* Reactivity.Reactivity;
    const sql = yield* SqlClient.SqlClient;
    const client = yield* EventLog.makeClient(AppEvents);

    const set = <Name extends string, S extends Schema.Schema.AnyNoContext>(
      setting: Setting<Name, S>,
      value: S["Type"]
    ) =>
      client("SettingChange", {
        name: setting.name,
        json: setting.encodeSync(value),
      });

    const get = <Name extends string, S extends Schema.Schema.AnyNoContext>(
      setting: Setting<Name, S>
    ) =>
      sql<{
        json: string;
      }>`SELECT json FROM settings WHERE name = ${setting.name}`.pipe(
        Effect.flatMap((rows) =>
          Array.head(rows).pipe(
            Option.filter((_) => _.json !== null && _.json !== '""')
          )
        ),
        Effect.flatMap((_) => setting.decode(_.json)),
        Effect.option
      );

    const stream = <Name extends string, S extends Schema.Schema.AnyNoContext>(
      setting: Setting<Name, S>
    ): Stream.Stream<Option.Option<S["Type"]>> =>
      reactivity.stream(["settings"], get(setting));

    return { set, get, stream } as const;
  }),
}) {}
