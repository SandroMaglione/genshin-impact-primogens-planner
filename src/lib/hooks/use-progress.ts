import { ProgressTable } from "../schema";
import { useDexieQuery } from "./use-dexie-query";

export const useProgress = () => {
  return useDexieQuery((_) => _.progress.toArray(), ProgressTable);
};
