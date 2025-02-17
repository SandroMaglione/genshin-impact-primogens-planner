import { DateTime, Duration } from "effect";
import { useEvents } from "../lib/hooks/use-events";
import type { EventTable, ProgressTable } from "../lib/schema";
import Fate from "./ui/fate";
import Primogem from "./ui/primogem";
import { Td } from "./ui/table";

interface Prediction {
  dayId: number;
  totalPrimogems: number;
  totalFates: number;
  date: DateTime.Utc;
  eventsPrimogems: number;
  eventsGenesisCrystals: number;
  eventsFates: number;
}

const buildPrediction = ({
  currentProgress,
  events,
  today,
}: {
  currentProgress: ProgressTable;
  events: readonly EventTable[];
  today: DateTime.Utc;
}) => {
  const predictionList: Prediction[] = [];
  let accumulatedFates = currentProgress.fates;
  let accumulatedPrimogems =
    currentProgress.primogems + currentProgress.genesisCrystals;

  for (let day = 0; day < 200; day++) {
    let eventsPrimogems = 0;
    let eventsFates = 0;
    let eventsGenesisCrystals = 0;

    accumulatedPrimogems += currentProgress.dailyPrimogems;
    const date = DateTime.addDuration(Duration.days(day))(today);

    events
      .filter((event) => {
        const eventDate = new Date(event.date).setHours(0, 0, 0, 0);
        const currentDate = DateTime.toDate(date).setHours(0, 0, 0, 0);
        return eventDate === currentDate;
      })
      .forEach((event) => {
        if (event.isApplied) {
          accumulatedPrimogems += event.primogems;
          accumulatedFates += event.fates;

          eventsGenesisCrystals += event.genesisCrystals;
          eventsPrimogems += event.primogems;
          eventsFates += event.fates;
        }
      });

    predictionList.push({
      dayId: day,
      eventsPrimogems,
      eventsFates,
      eventsGenesisCrystals,
      date,
      totalPrimogems: accumulatedPrimogems,
      totalFates: accumulatedFates + Math.floor(accumulatedPrimogems / 160),
    });
  }

  return predictionList;
};

export default function ProgressTablePrediction({
  currentProgress,
  today,
}: {
  today: DateTime.Utc;
  currentProgress: ProgressTable;
}) {
  const { data } = useEvents();
  const events = data ?? [];
  return (
    <table className="w-full">
      <tbody>
        {buildPrediction({ today, currentProgress, events }).map(
          (
            {
              eventsFates,
              eventsPrimogems,
              eventsGenesisCrystals,
              date,
              dayId,
              totalFates,
              totalPrimogems,
            },
            index
          ) => {
            return (
              <tr key={dayId}>
                <Td>
                  <p className="text-xl inline-flex items-center gap-x-0.5">
                    <span className="tabular-nums">
                      {totalPrimogems.toLocaleString()}
                    </span>
                    <Primogem className="size-6" />
                    {(eventsPrimogems !== 0 || eventsGenesisCrystals !== 0) && (
                      <span className="text-xs font-light">
                        (
                        {eventsPrimogems + eventsGenesisCrystals >= 0
                          ? "+"
                          : ""}
                        {(
                          eventsPrimogems + eventsGenesisCrystals
                        ).toLocaleString()}
                        )
                      </span>
                    )}
                  </p>
                </Td>
                <Td>
                  <p className="text-xl inline-flex items-center gap-x-0.5">
                    <span className="tabular-nums">{totalFates}</span>
                    <Fate className="size-6" />
                    {eventsFates !== 0 && (
                      <span className="text-xs font-light">
                        ({eventsFates >= 0 ? "+" : ""}
                        {eventsFates.toLocaleString()})
                      </span>
                    )}
                  </p>
                </Td>
                <Td className="text-right">
                  <div className="inline-flex items-center gap-x-2">
                    {totalFates >= 90 && (
                      <p className="text-sm font-light inline-flex items-center gap-x-0.5">
                        <span>{Math.floor(totalFates / 90)}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-4 text-accent"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </p>
                    )}
                    <p className="text-xl font-medium">
                      {DateTime.toDate(date).toLocaleDateString("en-US", {
                        weekday: "long",
                      })}
                    </p>
                  </div>
                  <p className="text-sm font-light">
                    {DateTime.toDate(date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                    })}
                  </p>
                </Td>
              </tr>
            );
          }
        )}
      </tbody>
    </table>
  );
}
