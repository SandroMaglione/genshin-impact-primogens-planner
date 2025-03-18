import * as Tabs from "@radix-ui/react-tabs";
import { createFileRoute } from "@tanstack/react-router";
import { useMachine } from "@xstate/react";
import clsx from "clsx";
import { Array, Effect, Encoding, Order, pipe } from "effect";
import { assertEvent, assign, fromPromise, setup } from "xstate";
import fullCharacters from "../assets/characters.json";
import CharactersList from "../components/characters-list";
import Button from "../components/ui/button";
import { mapElementToImage } from "../lib/constants";
import { useTeams } from "../lib/hooks/use-teams";
import { RuntimeClient } from "../lib/runtime-client";
import { Dexie } from "../lib/services/dexie";

const machine = setup({
  types: {
    context: {} as {
      currentIndex: 1 | 2 | 3 | 4;
      team: [string | null, string | null, string | null, string | null];
    },
    events: {} as
      | { type: "selection.update"; index: 1 | 2 | 3 | 4 }
      | { type: "team.update"; id: string }
      | { type: "team.confirm" }
      | { type: "team.remove"; id: number },
  },
  guards: {
    canConfirm: ({ context }) => context.team.every((id) => id !== null),
  },
  actors: {
    addTeam: fromPromise(
      ({
        input,
      }: {
        input: {
          team: [string | null, string | null, string | null, string | null];
        };
      }) =>
        RuntimeClient.runPromise(
          Effect.gen(function* () {
            const team1 = input.team[0];
            const team2 = input.team[1];
            const team3 = input.team[2];
            const team4 = input.team[3];

            if (
              team1 === null ||
              team2 === null ||
              team3 === null ||
              team4 === null
            ) {
              return yield* Effect.fail("Team is not complete");
            }

            return yield* Dexie.addTeam({ team: [team1, team2, team3, team4] });
          })
        )
    ),
    removeTeam: fromPromise(({ input }: { input: { teamId: number } }) =>
      RuntimeClient.runPromise(Dexie.deleteTeam({ teamId: input.teamId }))
    ),
  },
}).createMachine({
  id: "character-selection",
  context: { currentIndex: 1, team: [null, null, null, null] },
  initial: "Selection",
  states: {
    Selection: {
      on: {
        "selection.update": {
          actions: assign(({ event }) => ({
            currentIndex: event.index,
          })),
        },
        "team.update": {
          actions: assign(({ context, event }) => ({
            currentIndex:
              context.currentIndex === 1
                ? 2
                : context.currentIndex === 2
                  ? 3
                  : 4,
            team: [
              context.currentIndex === 1 ? event.id : context.team[0],
              context.currentIndex === 2 ? event.id : context.team[1],
              context.currentIndex === 3 ? event.id : context.team[2],
              context.currentIndex === 4 ? event.id : context.team[3],
            ] as const,
          })),
        },
        "team.confirm": {
          guard: "canConfirm",
          target: "Confirmation",
        },
        "team.remove": {
          target: "Removing",
        },
      },
    },
    Confirmation: {
      invoke: {
        src: "addTeam",
        input: ({ context }) => ({ team: context.team }),
        onError: { target: "Selection" },
        onDone: {
          target: "Selection",
          actions: assign(() => ({
            currentIndex: 1,
            team: [null, null, null, null],
          })),
        },
      },
    },
    Removing: {
      invoke: {
        src: "removeTeam",
        input: ({ event }) => {
          assertEvent(event, "team.remove");
          return { teamId: event.id };
        },
        onError: { target: "Selection" },
        onDone: { target: "Selection" },
      },
    },
  },
});

export const Route = createFileRoute("/character")({
  component: RouteComponent,
});

function RouteComponent() {
  const [snapshot, send] = useMachine(machine);
  const teams = useTeams();
  return (
    <section className="grid grid-cols-12 my-12 gap-x-12">
      <div className="col-span-4">
        <Tabs.Root defaultValue="teams">
          <Tabs.List className="grid grid-cols-2 mb-3">
            <Tabs.Trigger
              value="teams"
              className="px-4 py-2 border-b-2 border-b-transparent data-[state=active]:border-grey focus:outline-none data-[state=active]:font-bold hover:cursor-pointer"
            >
              Teams
            </Tabs.Trigger>
            <Tabs.Trigger
              value="characters"
              className="px-4 py-2 border-b-2 border-b-transparent data-[state=active]:border-grey focus:outline-none data-[state=active]:font-bold hover:cursor-pointer"
            >
              Characters
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="teams" className="flex flex-col gap-y-4">
            {teams.data?.map((team) => (
              <div key={team.teamId}>
                <div className="grid grid-cols-4 gap-x-2">
                  {team.characters.map((id) => {
                    const character = fullCharacters.find(
                      (character) => character.id === id
                    );
                    return (
                      <div key={id} className="relative">
                        <img
                          src={`/original/${Encoding.encodeBase64Url(
                            character?.name ?? ""
                          )}.webp`}
                          alt={character?.english_name ?? ""}
                          className={clsx(
                            character?.rarity === 5 && "bg-[#B47A49]",
                            character?.rarity === 4 && "bg-[#7A66A9]",
                            "w-full h-full object-cover rounded-md"
                          )}
                        />

                        <img
                          src={`/elements/${mapElementToImage[character?.element ?? ""]}.webp`}
                          alt={character?.element ?? ""}
                          className="absolute top-1 left-1 size-6 object-cover"
                        />
                      </div>
                    );
                  })}
                </div>

                <button
                  className="text-xs text-error/80 hover:text-error font-light w-full hover:cursor-pointer"
                  onClick={() => send({ type: "team.remove", id: team.teamId })}
                >
                  Remove
                </button>
              </div>
            ))}
          </Tabs.Content>

          <Tabs.Content value="characters" className="grid grid-cols-4 gap-2">
            {pipe(
              teams.data ?? [],
              Array.flatMap((team) => team.characters),
              Array.dedupe,
              Array.filterMap((id) =>
                Array.findFirst(fullCharacters, (c) => c.id === id)
              ),
              Array.sortBy(
                Order.mapInput(
                  Order.reverse(Order.number),
                  (character: (typeof fullCharacters)[number]) =>
                    character.rarity
                ),
                Order.mapInput(
                  Order.reverse(Order.string),
                  (character: (typeof fullCharacters)[number]) =>
                    character.element
                )
              ),
              Array.map((character) => (
                <div
                  key={character.name}
                  className="relative rounded-md overflow-hidden"
                >
                  <img
                    src={`/original/${Encoding.encodeBase64Url(
                      character.name
                    )}.webp`}
                    alt={character?.english_name ?? ""}
                    className={clsx(
                      character?.rarity === 5 && "bg-[#B47A49]",
                      character?.rarity === 4 && "bg-[#7A66A9]",
                      "w-full h-full object-cover rounded-md"
                    )}
                  />

                  <img
                    src={`/elements/${mapElementToImage[character?.element ?? ""]}.webp`}
                    alt={character?.element ?? ""}
                    className="absolute top-1 left-1 size-6 object-cover"
                  />
                </div>
              ))
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>

      <div className="col-span-8">
        <div className="flex flex-col gap-y-6">
          <div className="flex items-center justify-end">
            <Button
              className="px-4 py-1"
              onClick={() => send({ type: "team.confirm" })}
            >
              Add team
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-x-4 items-center justify-center">
            {([1, 2, 3, 4] as const).map((index) => {
              const character = fullCharacters.find(
                (character) => character.id === snapshot.context.team[index - 1]
              );
              return (
                <button
                  key={index}
                  className={clsx(
                    character?.rarity === 5 && "bg-[#B47A49]",
                    character?.rarity === 4 && "bg-[#7A66A9]",
                    character?.rarity !== 5 &&
                      character?.rarity !== 4 &&
                      "bg-grey opacity-75 hover:opacity-100",
                    snapshot.context.currentIndex === index &&
                      "shadow -translate-y-2 opacity-100",
                    "rounded-md flex items-center justify-center transition-transform duration-150 hover:cursor-pointer relative aspect-square"
                  )}
                  onClick={() => send({ type: "selection.update", index })}
                >
                  {snapshot.context.team[index - 1] && (
                    <img
                      src={`/original/${Encoding.encodeBase64Url(
                        character?.name ?? ""
                      )}.webp`}
                      alt={character?.name ?? ""}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {character && (
                    <img
                      src={`/elements/${mapElementToImage[character?.element ?? ""]}.webp`}
                      alt={character?.element ?? ""}
                      className="absolute top-2 left-2 size-10 object-cover"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12">
          <CharactersList
            onSelect={(id) => send({ type: "team.update", id })}
          />
        </div>
      </div>
    </section>
  );
}
