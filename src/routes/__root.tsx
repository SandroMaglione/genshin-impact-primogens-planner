import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Console, Effect } from "effect";
import { Dexie } from "../lib/services/dexie";
import { RuntimeClient } from "../lib/services/runtime-client";

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: (error) => <pre>{JSON.stringify(error, null, 2)}</pre>,
  loader: () =>
    RuntimeClient.runPromise(
      Effect.gen(function* () {
        const dexie = yield* Dexie;
        if (!(yield* dexie.progressExists)) {
          yield* dexie.addProgress;
        }

        yield* Console.log("Init DB completed");
      })
    ),
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
