import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Console, Effect } from "effect";
import { Dexie } from "../lib/services/dexie";
import { RuntimeClient } from "../lib/services/runtime-client";

import "../tailwind.css";

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: (error) => <pre>{JSON.stringify(error, null, 2)}</pre>,
  loader: () =>
    RuntimeClient.runPromise(
      Effect.gen(function* () {
        const dexie = yield* Dexie;
        if (!(yield* dexie.progressExists)) {
          yield* dexie.initProgress;
        }

        yield* Console.log("Init DB completed");
      })
    ),
});

function RootComponent() {
  return (
    <>
      <div className="mx-auto max-w-[60rem] my-12">
        <nav>
          <ul>
            <li>
              <a
                href="https://www.reddit.com/r/Genshin_Impact/?f=flair_name%3A%22%3Ahoyo1%3A%3Ahoyo2%3A%20Official%20Post%22"
                target="_blank"
              >
                Announcements
              </a>
            </li>
          </ul>
        </nav>
        <Outlet />
      </div>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
