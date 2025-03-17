import clsx from "clsx";
import { useState } from "react";
import fullCharacters from "../assets/characters.json";
import { useCharacter } from "../lib/hooks/use-character";

export default function CharactersList({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const { data } = useCharacter();
  const [search, setSearch] = useState("");
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between gap-x-12">
        <input
          type="text"
          value={search}
          placeholder="Search name"
          onChange={(e) => setSearch(e.target.value)}
          className="border border-grey rounded-md bg-white px-3 py-2 font-light text-sm flex-1"
        />
        <p className="font-light text-sm text-right">{`${data?.length ?? 0}/${fullCharacters.length} characters`}</p>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {fullCharacters
          .filter(({ english_name }) =>
            english_name.toLowerCase().includes(search.toLowerCase())
          )
          .map(({ id, name }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className="group hover:cursor-pointer rounded-md overflow-hidden"
            >
              <img
                src={`/images/${id}.png`}
                alt={name}
                title={name}
                className={clsx(
                  "transition-transform duration-150 ease-in-out",
                  data?.some((character) => character.name === name)
                    ? "scale-110 group-hover:grayscale-90 group-hover:opacity-90"
                    : "grayscale opacity-25 group-hover:grayscale-0 group-hover:opacity-100"
                )}
              />
            </button>
          ))}
      </div>
    </div>
  );
}
