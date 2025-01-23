import { createFileRoute } from "@tanstack/react-router";
import { DateTime, Duration } from "effect";
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
    <table>
      <thead>
        <tr>
          <th>Days</th>
          <th>Primogems</th>
          <th>Fates</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 100 }).map((_, index) => {
          const totalPrimogems =
            currentProgress.primogems + currentProgress.dailyPrimogems * index;
          const date = DateTime.toDate(
            DateTime.addDuration(Duration.days(index))(today)
          );
          return (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{totalPrimogems}</td>
              <td>
                {currentProgress.fates + Math.floor(totalPrimogems / 160)}
              </td>
              <td>{date.toDateString()}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
