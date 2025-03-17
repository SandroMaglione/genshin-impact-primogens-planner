import { TeamTable } from "../schema";
import { useDexieQuery } from "./use-dexie-query";

export const useTeams = () => {
  return useDexieQuery((_) => _.team.toArray(), TeamTable);
};
