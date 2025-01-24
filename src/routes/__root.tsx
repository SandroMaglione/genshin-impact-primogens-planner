import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Console, Effect } from "effect";
import { Dexie } from "../lib/services/dexie";
import { RuntimeClient } from "../lib/services/runtime-client";

import backgroundImgUrl from "../assets/images/background.jpg";

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
      <div
        className="inset-0 fixed h-dvh w-dvw bg-cover bg-center z-[-1]"
        style={{ backgroundImage: `url(${backgroundImgUrl})` }}
      />

      <div className="mx-auto max-w-[70rem] py-12 px-20 backdrop-blur-[24px] bg-white/90">
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
