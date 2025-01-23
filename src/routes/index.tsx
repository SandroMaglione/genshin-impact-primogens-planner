import { createFileRoute } from "@tanstack/react-router";
import clsx from "clsx";
import { DateTime, Duration } from "effect";
import DaysBeforeFates from "../components/days-before-fates";
import { Td, Th } from "../components/table";
import UpdateProgressForm from "../components/update-progress-form";
import { useProgress } from "../lib/hooks/use-progress";
import { RuntimeClient } from "../lib/services/runtime-client";

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
    <main className="my-12 flex flex-col gap-y-8">
      <UpdateProgressForm progress={currentProgress} />

      <hr />

      <DaysBeforeFates currentProgress={currentProgress} today={today} />

      <hr />

      <table className="w-full">
        <thead>
          <tr className="border-b border-grey">
            <Th className="text-left">Days</Th>
            <Th className="text-left">Primogems</Th>
            <Th className="text-left">Fates</Th>
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
                  <p className="text-xl">{totalPrimogems}</p>
                  <p className="text-sm font-light">{collectedPrimogems}</p>
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
    </main>
  );
}
