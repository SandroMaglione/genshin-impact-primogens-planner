import { createFileRoute } from "@tanstack/react-router";
import { DateTime } from "effect";
import AddEventForm from "../components/add-event-form";
import DaysBeforeFates from "../components/days-before-fates";
import ListEvents from "../components/list-events";
import ProgressTablePrediction from "../components/progress-table-prediction";
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

        <AddEventForm />

        <ListEvents />
      </section>
    </main>
  );
}
