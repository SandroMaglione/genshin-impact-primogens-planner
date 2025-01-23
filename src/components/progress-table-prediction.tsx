import clsx from "clsx";
import { DateTime, Duration } from "effect";
import { useEvents } from "../lib/hooks/use-events";
import type { EventTable, ProgressTable } from "../lib/schema";
import Fate from "./fate";
import Primogem from "./primogem";
import { Td, Th } from "./table";

interface Prediction {
  dayId: number;
  totalPrimogems: number;
  totalFates: number;
  date: DateTime.Utc;
  eventsPrimogems: number;
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
  let accumulatedPrimogems = currentProgress.primogems;

  for (let day = 0; day < 100; day++) {
    let eventsPrimogems = 0;
    let eventsFates = 0;

    accumulatedPrimogems += currentProgress.dailyPrimogems;
    const date = DateTime.addDuration(Duration.days(day))(today);

    events
      .filter((event) => {
        const eventDate = new Date(event.date).setHours(0, 0, 0, 0);
        const currentDate = DateTime.toDate(date).setHours(0, 0, 0, 0);
        return eventDate === currentDate;
      })
      .forEach((event) => {
        accumulatedPrimogems += event.primogems;
        accumulatedFates += event.fates;

        eventsPrimogems += event.primogems;
        eventsFates += event.fates;
      });

    predictionList.push({
      dayId: day,
      eventsPrimogems,
      eventsFates,
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
      <thead>
        <tr>
          <Th className="text-left">Days</Th>
          <Th className="text-left">
            <Primogem className="size-8" />
          </Th>
          <Th className="text-left">
            <Fate className="size-8" />
          </Th>
          <Th className="text-right">Date</Th>
        </tr>
      </thead>
      <tbody>
        {buildPrediction({ today, currentProgress, events }).map(
          (
            {
              eventsFates,
              eventsPrimogems,
              date,
              dayId,
              totalFates,
              totalPrimogems,
            },
            index
          ) => {
            return (
              <tr
                key={dayId}
                className={clsx(
                  totalFates >= 90 && "bg-primary/10",
                  totalFates >= 180 && "bg-primary/20"
                )}
              >
                <Td className="font-light text-sm">{dayId}</Td>
                <Td>
                  <p className="text-xl">
                    {totalPrimogems.toLocaleString()}{" "}
                    {eventsPrimogems !== 0 && (
                      <span className="text-sm font-light">
                        (+{eventsPrimogems})
                      </span>
                    )}
                  </p>
                </Td>
                <Td>
                  <p className="text-xl">
                    {totalFates}{" "}
                    {eventsFates !== 0 && (
                      <span className="text-sm font-light">
                        (+{eventsFates})
                      </span>
                    )}
                  </p>
                </Td>
                <Td className="text-right">
                  <p className="text-xl font-medium">
                    {DateTime.toDate(date).toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                  </p>
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
