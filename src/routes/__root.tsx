import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Console, Effect } from "effect";
import { Dexie } from "../lib/services/dexie";
import { RuntimeClient } from "../lib/services/runtime-client";

import genshinImpactLogoImgUrl from "../assets/images/genshin-impact-logo.webp";

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
    <div className="mx-auto max-w-[72rem] py-12 px-20">
      <nav className="flex items-center justify-between">
        <img
          src={genshinImpactLogoImgUrl}
          alt="genshin impact logo"
          className="h-8"
        />

        <ul className="flex items-center justify-end gap-x-12">
          <li>
            <a
              href="https://www.youtube.com/@GenshinImpact"
              target="_blank"
              className="text-sm font-light hover:underline"
            >
              Youtube
            </a>
          </li>
          <li>
            <a
              href="https://www.youtube.com/@Genshin_JP"
              target="_blank"
              className="text-sm font-light hover:underline"
            >
              JP Youtube
            </a>
          </li>
          <li>
            <a
              href="https://www.reddit.com/r/Genshin_Impact/?f=flair_name%3A%22%3Ahoyo1%3A%3Ahoyo2%3A%20Official%20Post%22"
              target="_blank"
              className="text-sm font-light hover:underline"
            >
              Announcements
            </a>
          </li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
}
