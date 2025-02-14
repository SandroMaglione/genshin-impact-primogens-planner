import { SqlClient } from "@effect/sql";
import { Effect } from "effect";

export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  yield* sql`
    CREATE TABLE settings (
      name TEXT PRIMARY KEY,
      json TEXT NOT NULL
    )
  `;

  //   yield* sql`INSERT INTO settings ${sql.insert([
  //     {
  //       name: currentGroupId.name,
  //       json: currentGroupId.encodeSync(initialReceiptGroupId),
  //     },
  //     {
  //       name: openaiModel.name,
  //       json: JSON.stringify("gpt-4o"),
  //     },
  //   ])}`;
});
