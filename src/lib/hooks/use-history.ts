import { Array, Option, Order, pipe, Schema } from "effect";
import { HistoryTable } from "../schema";
import { useDexieQuery } from "./use-dexie-query";

export const useHistory = () => {
  return useDexieQuery(
    async (_) =>
      pipe(
        await _.history.toArray(),
        Array.sortBy(Order.mapInput(Order.Date, (_) => new Date(_.date))),
        Array.reduce(
          [] as (typeof HistoryTable.Encoded & {
            difference: number | null;
          })[],
          (acc, _) => [
            ...acc,
            {
              ..._,
              difference: pipe(
                acc,
                Array.last,
                Option.match({
                  onNone: () => null,
                  onSome: (last) => _.primogems - last.primogems,
                })
              ),
            },
          ]
        )
      ),
    Schema.Struct({
      ...HistoryTable.fields,
      difference: Schema.NullOr(Schema.Number),
    })
  );
};
