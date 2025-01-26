import { Array, Order, pipe } from "effect";
import { EventTable } from "../schema";
import { useDexieQuery } from "./use-dexie-query";

export const useEvents = () => {
  return useDexieQuery(
    async (_) =>
      pipe(
        await _.event.toArray(),
        Array.sortBy(Order.mapInput(Order.Date, (_) => new Date(_.date)))
      ),
    EventTable
  );
};
