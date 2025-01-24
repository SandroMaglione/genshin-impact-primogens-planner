import { DateTime, Duration } from "effect";
import { useState } from "react";
import { useEvents } from "../lib/hooks/use-events";
import type { EventTable, ProgressTable } from "../lib/schema";
import Primogem from "./primogem";
import SaveInput from "./ui/save-input";

const daysBeforeFates = ({
  currentProgress,
  events,
  today,
  goal,
}: {
  goal: number;
  currentProgress: ProgressTable;
  events: readonly EventTable[];
  today: DateTime.Utc;
}) => {
  let accumulatedFates = currentProgress.fates;
  let accumulatedPrimogems = currentProgress.primogems;
  let day = 0;

  while (true) {
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
      });

    if (accumulatedFates + Math.floor(accumulatedPrimogems / 160) >= goal) {
      return day;
    } else {
      day += 1;
    }
  }
};

export default function DaysBeforeFates({
  currentProgress,
  today,
}: {
  today: DateTime.Utc;
  currentProgress: ProgressTable;
}) {
  const { data } = useEvents();
  const [goal, setGoal] = useState(90);
  const daysToFates = daysBeforeFates({
    today,
    goal,
    currentProgress,
    events: data ?? [],
  });
  const dateForFates = DateTime.toDate(
    DateTime.addDuration(Duration.days(daysToFates))(today)
  );
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center gap-x-4 text-xl font-light">
        <label htmlFor="goal">Reaching</label>{" "}
        <div className="inline-flex items-center gap-x-1">
          <SaveInput<"goal">
            type="number"
            id="goal"
            name="goal"
            className="max-w-[6rem]"
            value={goal}
            onChange={(event) => setGoal(event.target.valueAsNumber)}
          />{" "}
          <Primogem className="size-6" />
        </div>
        <span>will take</span>
        <div className="text-center inline-flex gap-x-2 items-center">
          <p className="text-5xl font-bold">{daysToFates}</p>
          <p className="text-sm font-bold">Days</p>
        </div>
      </div>
      <p className="text-sm font-light">
        on{" "}
        {dateForFates.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "2-digit",
        })}
      </p>
    </div>
  );
}
