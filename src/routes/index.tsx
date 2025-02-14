import { createFileRoute } from "@tanstack/react-router";
import { DateTime } from "effect";
import AddEventForm from "../components/add-event-form";
import AddHistoryForm from "../components/add-history-form";
import CharactersList from "../components/characters-list";
import DaysBeforeFates from "../components/days-before-fates";
import ListEvents from "../components/list-events";
import ListHistory from "../components/list-history";
import ProgressTablePrediction from "../components/progress-table-prediction";
import Fate from "../components/ui/fate";
import Primogem from "../components/ui/primogem";
import Tutorial from "../components/ui/tutorial";
import UpdateProgressForm from "../components/update-progress-form";
import { useProgress } from "../lib/hooks/use-progress";
import { RuntimeClient } from "../lib/runtime-client";

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
    <>
      <main className="my-12 grid-cols-12 grid gap-x-20">
        <section className="flex flex-col gap-y-8 col-span-7">
          <DaysBeforeFates currentProgress={currentProgress} today={today} />

          <ProgressTablePrediction
            currentProgress={currentProgress}
            today={today}
          />
        </section>

        <section className="flex flex-col gap-y-8 col-span-5">
          <UpdateProgressForm progress={currentProgress} />

          <hr className="text-grey" />

          <AddHistoryForm currentProgress={currentProgress} />
          <ListHistory />

          <hr className="text-grey" />

          <AddEventForm />
          <ListEvents />

          <hr className="text-grey" />

          <CharactersList />
        </section>
      </main>

      <Tutorial
        contentList={[
          [
            "tut-current-primogems",
            <span>
              Enter the current amount of <Primogem className="size-8 inline" />{" "}
              you have
            </span>,
          ],
          [
            "tut-current-fates",
            <span>
              Enter the current amount of <Fate className="size-8 inline" /> you
              have
            </span>,
          ],
          [
            "tut-primogems-day",
            <span>
              Enter the average <Primogem className="size-8 inline" /> you
              expect to earn per day
            </span>,
          ],
          [
            "tut-target-fates",
            <span>
              Enter your target amount of <Fate className="size-8 inline" />
            </span>,
          ],
          [
            "tut-history",
            <span>
              Each day you can keep track of how many{" "}
              <Primogem className="size-8 inline" /> you earned
            </span>,
          ],
          [
            "tut-events",
            <span>
              You can enter events that will guarantee you{" "}
              <Primogem className="size-8 inline" /> or{" "}
              <Fate className="size-8 inline" /> in the future
            </span>,
          ],
        ]}
      />
    </>
  );
}
