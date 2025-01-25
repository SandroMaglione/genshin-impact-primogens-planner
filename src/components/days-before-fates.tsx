import { DateTime, Duration } from "effect";
import { useActionEffect } from "../lib/hooks/use-action-effect";
import { useActionReactive } from "../lib/hooks/use-action-reactive";
import { useEvents } from "../lib/hooks/use-events";
import type { EventTable, ProgressTable } from "../lib/schema";
import { Dexie } from "../lib/services/dexie";
import Fate from "./fate";
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
        if (event.isApplied) {
          accumulatedPrimogems += event.primogems;
          accumulatedFates += event.fates;
        }
      });

    if (accumulatedFates + Math.floor(accumulatedPrimogems / 160) >= goal) {
      return day;
    } else {
      if (day > 10000) {
        return Infinity;
      }

      day += 1;
    }
  }
};

type FormName = "fatesGoal" | "progressId";

export default function DaysBeforeFates({
  currentProgress,
  today,
}: {
  today: DateTime.Utc;
  currentProgress: ProgressTable;
}) {
  const { data } = useEvents();
  const [_, action] = useActionEffect(Dexie.updateFatesGoal);
  const [formRef, onChange] = useActionReactive(action);
  const daysToFates = daysBeforeFates({
    today,
    goal: currentProgress.fatesGoal,
    currentProgress,
    events: data ?? [],
  });
  const dateForFates = DateTime.toDate(
    DateTime.addDuration(Duration.days(daysToFates))(today)
  );
  return (
    <div className="flex flex-col gap-y-2">
      <form
        ref={formRef}
        className="flex items-center gap-x-4 text-xl font-light"
      >
        <SaveInput<FormName>
          type="hidden"
          name="progressId"
          value={currentProgress.progressId}
        />
        <label htmlFor="goal">Reaching</label>{" "}
        <div className="inline-flex items-center gap-x-1">
          <SaveInput<FormName>
            type="number"
            id="goal"
            name="fatesGoal"
            className="max-w-[6rem]"
            value={currentProgress.fatesGoal}
            onChange={onChange}
          />{" "}
          <Fate className="size-6" />
        </div>
        <span>will take</span>
        <div className="text-center inline-flex gap-x-2 items-center">
          <p className="text-5xl font-bold">
            {daysToFates === Infinity ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-12"
              >
                <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z" />
              </svg>
            ) : (
              daysToFates
            )}
          </p>
          <p className="text-sm font-bold">Days</p>
        </div>
      </form>
      <p className="font-light">
        {daysToFates === Infinity ? (
          "Never 🥲"
        ) : (
          <>
            on{" "}
            {dateForFates.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "2-digit",
            })}
          </>
        )}
      </p>
    </div>
  );
}
