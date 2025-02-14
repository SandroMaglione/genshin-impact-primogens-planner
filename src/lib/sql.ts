import { SqliteClient, SqliteMigrator } from "@effect/sql-sqlite-wasm";
import { Effect, Layer, String } from "effect";

import SqlWorker from "./worker?worker";

const ClientLive = SqliteClient.layer({
  worker: Effect.acquireRelease(
    Effect.sync(() => new SqlWorker()),
    (worker) => Effect.sync(() => worker.terminate())
  ),
  transformQueryNames: String.camelToSnake,
  transformResultNames: String.snakeToCamel,
});

export const runMigrations = SqliteMigrator.run({
  loader: SqliteMigrator.fromGlob(import.meta.glob("./migrations/*")),
});

export const SqlLive = Layer.effectDiscard(runMigrations).pipe(
  Layer.provideMerge(ClientLive)
);
