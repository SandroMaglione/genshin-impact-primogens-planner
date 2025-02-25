import { DateTime, Duration } from "effect";
import React from "react";
import iconWishUrl from "../assets/images/icon-wish.webp";
import { useEvents } from "../lib/hooks/use-events";
import type { EventTable, ProgressTable } from "../lib/schema";
import Fate from "./ui/fate";
import GenesisCrystal from "./ui/genesis-crystal";
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
  reachGuaranteedFate: boolean;
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
    const prevReachGuaranteedFate =
      (accumulatedFates + Math.floor(accumulatedPrimogems / 160)) % 90;

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

    const currentReachGuaranteedFate =
      (accumulatedFates + Math.floor(accumulatedPrimogems / 160)) % 90;

    predictionList.push({
      dayId: day,
      eventsPrimogems,
      eventsFates,
      eventsGenesisCrystals,
      date,
      totalPrimogems: accumulatedPrimogems,
      totalFates: accumulatedFates + Math.floor(accumulatedPrimogems / 160),
      reachGuaranteedFate: currentReachGuaranteedFate < prevReachGuaranteedFate,
    });
  }

  return predictionList;
};

const isThreeWeekInterval = (targetDate: DateTime.Utc): boolean => {
  const startDate = DateTime.unsafeMake("2025-02-11T00:00:00Z");
  const duration = DateTime.distanceDuration(startDate, targetDate);
  const daysDifference = Math.floor(Duration.toDays(duration));
  return daysDifference % 21 === 0;
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
              reachGuaranteedFate,
            },
            index
          ) => {
            const isNewBanner = isThreeWeekInterval(date);
            return (
              <React.Fragment key={dayId}>
                {isNewBanner && (
                  <tr>
                    <td colSpan={3} className="text-center py-4">
                      <p className="bg-[#D2A366] text-white py-1 flex gap-x-2 items-center justify-center rounded-md">
                        <img
                          src={iconWishUrl}
                          alt="new-banner-icon"
                          className="size-6 inline-block"
                        />
                        <span className="font-bold text-sm">
                          Character Event Wish
                        </span>
                      </p>
                    </td>
                  </tr>
                )}

                {reachGuaranteedFate && (
                  <tr>
                    <td colSpan={3} className="text-center py-4">
                      <p className="bg-[#51A2F0] text-white py-1 flex gap-x-2 items-center justify-center rounded-md">
                        <span className="font-bold text-sm">5★ Character</span>
                      </p>
                    </td>
                  </tr>
                )}

                {(eventsPrimogems !== 0 ||
                  eventsGenesisCrystals !== 0 ||
                  eventsFates !== 0) && (
                  <tr>
                    <td colSpan={3} className="text-center py-4">
                      <div className="flex gap-x-4 items-center justify-center">
                        {eventsPrimogems !== 0 && (
                          <p className="inline-flex items-center gap-x-1 font-light">
                            <span>
                              {eventsPrimogems >= 0 ? "+" : ""}
                              {eventsPrimogems.toLocaleString()}
                            </span>
                            <Primogem className="size-6" />
                          </p>
                        )}
                        {eventsGenesisCrystals !== 0 && (
                          <p className="inline-flex items-center gap-x-1 font-light">
                            <span>
                              {eventsGenesisCrystals >= 0 ? "+" : ""}
                              {eventsGenesisCrystals.toLocaleString()}
                            </span>
                            <GenesisCrystal className="size-6" />
                          </p>
                        )}
                        {eventsFates !== 0 && (
                          <p className="inline-flex items-center gap-x-1 font-light">
                            <span>
                              {eventsFates >= 0 ? "+" : ""}
                              {eventsFates.toLocaleString()}
                            </span>
                            <Fate className="size-6" />
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                <tr>
                  <Td>
                    <p className="text-xl inline-flex items-center gap-x-0.5">
                      <span className="tabular-nums">
                        {totalPrimogems.toLocaleString()}
                      </span>
                      <Primogem className="size-6" />
                    </p>
                  </Td>
                  <Td>
                    <p className="text-xl inline-flex items-center gap-x-0.5">
                      <span className="tabular-nums">{totalFates}</span>
                      <Fate className="size-6" />
                    </p>
                  </Td>
                  <Td className="text-right">
                    <p className="text-xl font-light">
                      {DateTime.toDate(date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>

                    <div className="inline-flex items-center gap-x-2">
                      {totalFates >= 90 && (
                        <p className="text-xs font-light inline-flex items-center gap-x-0.5">
                          5★ (<span>{Math.floor(totalFates / 90)}</span>)
                        </p>
                      )}
                      <p className="text-sm font-medium">
                        {DateTime.toDate(date).toLocaleDateString("en-US", {
                          weekday: "long",
                        })}
                      </p>
                    </div>
                  </Td>
                </tr>
              </React.Fragment>
            );
          }
        )}
      </tbody>
    </table>
  );
}
