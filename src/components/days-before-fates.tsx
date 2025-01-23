import { DateTime, Duration } from "effect";
import { useState } from "react";
import { useEvents } from "../lib/hooks/use-events";
import type { EventTable, ProgressTable } from "../lib/schema";

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
      <div>
        <label htmlFor="goal">Goal</label>
        <input
          type="number"
          id="goal"
          value={goal}
          onChange={(event) => setGoal(event.target.valueAsNumber)}
        />
      </div>
      <div className="flex items-center gap-x-4">
        <div className="text-center">
          <p className="text-5xl font-light">{daysToFates}</p>
          <p className="text-sm font-light">Days</p>
        </div>
        <div>
          <p className="text-xl font-medium">
            {dateForFates.toLocaleDateString("en-US", {
              weekday: "long",
            })}
          </p>
          <p className="text-sm font-light">
            {dateForFates.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
