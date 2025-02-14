import { CharacterTable } from "../schema";
import { useDexieQuery } from "./use-dexie-query";

export const useCharacter = () => {
  return useDexieQuery((_) => _.character.toArray(), CharacterTable);
};
