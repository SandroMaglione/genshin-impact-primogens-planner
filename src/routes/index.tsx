import { createFileRoute } from "@tanstack/react-router";
import clsx from "clsx";
import { DateTime, Duration } from "effect";
import DaysBeforeFates from "../components/days-before-fates";
import { Td, Th } from "../components/table";
import UpdateProgressForm from "../components/update-progress-form";
import { useProgress } from "../lib/hooks/use-progress";
import { RuntimeClient } from "../lib/services/runtime-client";

import fateImgUrl from "../assets/images/fate.webp";
import primogemImgUrl from "../assets/images/primogem.webp";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  loader: () => RuntimeClient.runPromise(DateTime.now),
});

function HomeComponent() {
  const today = Route.useLoaderData();
  const { data, error, loading } = useProgress();

  if (loading) {
    return <div>Loading...</div>;
  } else if (error) {
    return <div>Error: {error.reason}</div>;
  }

  const currentProgress = data[0];

  if (currentProgress === undefined) {
    return <div>No data</div>;
  }

  return (
    <main className="my-12 grid-cols-12 grid gap-x-12">
      <section className="flex flex-col gap-y-8 col-span-7">
        <DaysBeforeFates currentProgress={currentProgress} today={today} />

        <hr />

        <table className="w-full">
          <thead>
            <tr>
              <Th className="text-left">Days</Th>
              <Th className="text-left">
                <img
                  src={primogemImgUrl}
                  alt="primogem-icon"
                  className="size-8"
                />
              </Th>
              <Th className="text-left">
                <img src={fateImgUrl} alt="fate-icon" className="size-8" />
              </Th>
              <Th className="text-right">Date</Th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 100 }).map((_, index) => {
              const dayIndex = index + 1;
              const collectedPrimogems =
                currentProgress.dailyPrimogems * dayIndex;
              const totalPrimogems =
                currentProgress.primogems + collectedPrimogems;
              const collectedFates = Math.floor(totalPrimogems / 160);
              const totalFates = currentProgress.fates + collectedFates;
              const date = DateTime.toDate(
                DateTime.addDuration(Duration.days(index))(today)
              );
              return (
                <tr
                  key={index}
                  className={clsx(
                    totalFates >= 90 && "bg-primary/10",
                    totalFates >= 180 && "bg-primary/20"
                  )}
                >
                  <Td className="font-light text-sm">{dayIndex}</Td>
                  <Td>
                    <p className="text-xl">{totalPrimogems.toLocaleString()}</p>
                    <p className="text-sm font-light">
                      {collectedPrimogems.toLocaleString()}
                    </p>
                  </Td>
                  <Td>
                    <p className="text-xl">{totalFates}</p>
                    <p className="text-sm font-light">{collectedFates}</p>
                  </Td>
                  <Td className="text-right">
                    <p className="text-xl font-medium">
                      {date.toLocaleDateString("en-US", { weekday: "long" })}
                    </p>
                    <p className="text-sm font-light">
                      {date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      })}
                    </p>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-y-8 col-span-5">
        <UpdateProgressForm progress={currentProgress} />

        <hr />

        <div className="flex flex-col gap-y-2">
          <h2 className="text-2xl font-medium">About</h2>
          <p className="font-light">
            This is a simple tool to help you track your Primogems and Fates
            progress in Genshin Impact.
          </p>
          <p className="font-light">
            You can update your current progress by filling in the form on the
            left.
          </p>
          <p className="font-light">
            The table on the left shows you how many primogems and fates you
            will have in the next 100 days.
          </p>
        </div>
      </section>
    </main>
  );
}
