import { createFileRoute } from "@tanstack/react-router";
import { useMachine } from "@xstate/react";
import clsx from "clsx";
import { Effect } from "effect";
import { assign, fromPromise, setup } from "xstate";
import CharactersList from "../components/characters-list";
import Button from "../components/ui/button";
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
      | { type: "team.confirm" },
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
  },
});

export const Route = createFileRoute("/character")({
  component: RouteComponent,
});

function RouteComponent() {
  const [snapshot, send] = useMachine(machine);
  const teams = useTeams();
  return (
    <section className="grid grid-cols-12 my-12 divide-x divide-grey">
      <div className="col-span-4 px-6 flex flex-col gap-y-4">
        {teams.data?.map((team) => (
          <div key={team.teamId} className="grid grid-cols-4 gap-x-1">
            {team.characters.map((character) => (
              <img
                src={`/images/${character}.png`}
                alt={character}
                className="w-full h-full object-cover rounded-md border border-grey"
              />
            ))}
          </div>
        ))}
      </div>
      <div className="col-span-8 divide-y divide-grey">
        <div className="flex flex-col gap-y-8 px-12 pb-12">
          <div className="flex items-center justify-end">
            <Button
              className="px-4 py-1"
              onClick={() => send({ type: "team.confirm" })}
            >
              Add team
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-x-4 items-center justify-center">
            {([1, 2, 3, 4] as const).map((index) => (
              <button
                key={index}
                className={clsx(
                  snapshot.context.currentIndex === index &&
                    "shadow -translate-y-2",
                  "aspect-[0.8/1] bg-[#F0EDE6] rounded-md flex items-center justify-center transition-transform duration-150 hover:cursor-pointer"
                )}
                onClick={() => send({ type: "selection.update", index })}
              >
                {snapshot.context.team[index - 1] ? (
                  <img
                    src={`/images/${snapshot.context.team[index - 1]}.png`}
                    alt={snapshot.context.team[index - 1] ?? ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-light">+</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-12">
          <CharactersList
            onSelect={(id) => send({ type: "team.update", id })}
          />
        </div>
      </div>
    </section>
  );
}
