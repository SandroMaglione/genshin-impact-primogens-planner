import { DateTime, Duration } from "effect";
import { useActionEffect } from "../lib/hooks/use-action-effect";
import { useEvents } from "../lib/hooks/use-events";
import type { EventTable, ProgressTable } from "../lib/schema";
import { Dexie } from "../lib/services/dexie";
import Label from "./ui/label";
import Primogem from "./ui/primogem";
import SaveInput from "./ui/save-input";

const daysBeforeFates = ({
  currentProgress,
  events,
  today,
  fatesGoal,
}: {
  fatesGoal: number;
  currentProgress: ProgressTable;
  events: readonly EventTable[];
  today: DateTime.Utc;
}) => {
  let accumulatedFates = currentProgress.fates;
  let accumulatedPrimogems =
    currentProgress.primogems + currentProgress.genesisCrystals;
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
          accumulatedPrimogems += event.primogems + event.genesisCrystals;
          accumulatedFates += event.fates;
        }
      });

    if (
      accumulatedFates + Math.floor(accumulatedPrimogems / 160) >=
      fatesGoal
    ) {
      return day;
    } else {
      if (day > 10000) {
        return Infinity;
      }

      day += 1;
    }
  }
};

const dailyPrimogemsForTargetDate = ({
  currentProgress,
  targetDate,
  events,
  today,
  fatesGoal,
}: {
  fatesGoal: number;
  currentProgress: ProgressTable;
  events: readonly EventTable[];
  targetDate: Date;
  today: DateTime.Utc;
}) => {
  let accumulatedFates = currentProgress.fates;
  let accumulatedPrimogems =
    currentProgress.primogems + currentProgress.genesisCrystals;
  let day = 0;
  let distanceInDays = Duration.toDays(
    DateTime.distanceDuration(today, DateTime.unsafeFromDate(targetDate))
  );

  while (day < distanceInDays) {
    const date = DateTime.addDuration(Duration.days(day))(today);
    events
      .filter((event) => {
        const eventDate = new Date(event.date).setHours(0, 0, 0, 0);
        const currentDate = DateTime.toDate(date).setHours(0, 0, 0, 0);
        return eventDate === currentDate;
      })
      .forEach((event) => {
        if (event.isApplied) {
          accumulatedPrimogems += event.primogems + event.genesisCrystals;
          accumulatedFates += event.fates;
        }
      });

    if (day > 10000) {
      return Infinity;
    }

    day += 1;
  }

  const totalPrimogems = accumulatedPrimogems + accumulatedFates * 160;
  const goalPrimogems = fatesGoal * 160;

  return totalPrimogems > goalPrimogems
    ? 0
    : Math.ceil((goalPrimogems - totalPrimogems) / distanceInDays);
};

type FormName = "dailyPrimogems" | "targetDate";

export default function TargetForm({
  currentProgress,
  today,
}: {
  today: DateTime.Utc;
  currentProgress: ProgressTable;
}) {
  const { data } = useEvents();
  const [, onChange] = useActionEffect(Dexie.changeProgress);
  const daysToFates = daysBeforeFates({
    today,
    currentProgress,
    events: data ?? [],
    fatesGoal: currentProgress.fatesGoal,
  });
  const primogemsEachDay = dailyPrimogemsForTargetDate({
    today,
    currentProgress,
    events: data ?? [],
    fatesGoal: currentProgress.fatesGoal,
    targetDate: currentProgress.targetDate,
  });
  const dateForFates = DateTime.toDate(
    DateTime.addDuration(Duration.days(daysToFates))(today)
  );
  return (
    <section className="flex flex-col gap-y-4">
      <div
        id="tut-primogems-day"
        className="flex gap-x-4 items-center font-light"
      >
        <span>With</span>

        <div className="flex gap-x-2 items-center">
          <SaveInput<FormName>
            type="number"
            min={0}
            id="dailyPrimogems"
            name="dailyPrimogems"
            className="max-w-[6rem]"
            defaultValue={currentProgress.dailyPrimogems}
            onChange={(event) =>
              onChange({
                progressId: currentProgress.progressId,
                dailyPrimogems: event.target.value,
              })
            }
          />
          <Label htmlFor="dailyPrimogems" className="flex items-center gap-x-1">
            <Primogem className="size-8" />
            <span className="text-sm block font-light">/ day</span>
          </Label>
        </div>

        <div className="flex flex-col justify-end items-end flex-1">
          <p className="text-xl font-medium">
            {daysToFates === Infinity
              ? "Never 🥲"
              : dateForFates.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
          </p>
          <span className="text-sm font-light">{`${daysToFates} days`}</span>
        </div>
      </div>

      <div className="flex gap-x-4 items-center font-light">
        <span>Before</span>

        <SaveInput<FormName>
          type="date"
          aria-label="Target date"
          id="date"
          name="targetDate"
          className="min-w-[12rem]"
          defaultValue={currentProgress.targetDate.toISOString().split("T")[0]}
          onChange={(event) =>
            onChange({
              progressId: currentProgress.progressId,
              targetDate: event.target.value,
            })
          }
        />

        <div className="flex-1 flex gap-x-2 items-center justify-end">
          <span className="text-xl font-medium">{primogemsEachDay}</span>
          <Label htmlFor="dailyPrimogems" className="flex items-center gap-x-1">
            <Primogem className="size-8" />
            <span className="text-sm block font-light">/ day</span>
          </Label>
        </div>
      </div>
    </section>
  );
}
