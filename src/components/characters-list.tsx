import clsx from "clsx";
import { Array, Encoding, Order, pipe } from "effect";
import { useState } from "react";
import fullCharacters from "../assets/characters.json";
import { mapElementToImage } from "../lib/constants";
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
        {pipe(
          fullCharacters,
          Array.filter(({ english_name }) =>
            english_name.toLowerCase().includes(search.toLowerCase())
          ),
          Array.sortBy(
            Order.mapInput(
              Order.reverse(Order.number),
              (character: (typeof fullCharacters)[number]) => character.rarity
            ),
            Order.mapInput(
              Order.reverse(Order.string),
              (character: (typeof fullCharacters)[number]) => character.element
            )
          ),
          Array.map(({ id, name, english_name, rarity, element }) => (
            <button
              key={name}
              type="button"
              onClick={() => onSelect(id)}
              className="relative group hover:cursor-pointer rounded-md overflow-hidden"
            >
              <img
                src={`/original/${Encoding.encodeBase64Url(name)}.webp`}
                alt={english_name}
                title={english_name}
                className={clsx(
                  "transition-transform duration-150 ease-in-out group-hover:scale-105",
                  rarity === 5 && "bg-[#B47A49]",
                  rarity === 4 && "bg-[#7A66A9]"
                )}
              />

              <img
                src={`/elements/${mapElementToImage[element ?? ""]}.webp`}
                alt={element ?? ""}
                className="absolute top-2 left-2 size-8 object-cover"
              />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
