import { DateTime, Duration } from "effect";
import { useState } from "react";
import type { ProgressTable } from "../lib/schema";

const daysBeforeFates = (goal: number, currentProgress: ProgressTable) => {
  // goal = fates + (x * daily + primogems) / 160;
  const fates = currentProgress.fates;
  const daily = currentProgress.dailyPrimogems;
  const primogems = currentProgress.primogems;

  const to90 = ((goal - fates) * 160) / daily - primogems / daily;
  return Math.floor(to90);
};

export default function DaysBeforeFates({
  currentProgress,
  today,
}: {
  today: DateTime.Utc;
  currentProgress: ProgressTable;
}) {
  const [goal, setGoal] = useState(90);
  const daysToFates = daysBeforeFates(goal, currentProgress);
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
