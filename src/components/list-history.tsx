import { Array, DateTime, Duration, Option, pipe } from "effect";
import { useActionEffect } from "../lib/hooks/use-action-effect";
import { useHistory } from "../lib/hooks/use-history";
import { Dexie } from "../lib/services/dexie";
import Button from "./ui/button";
import Primogem from "./ui/primogem";
import SaveInput from "./ui/save-input";

export default function ListHistory() {
  const { data, error, loading } = useHistory();
  const [, onDelete, pendingDelete] = useActionEffect(Dexie.deleteHistory);
  const [, onUpdate] = useActionEffect(Dexie.updateHistory);

  if (loading) {
    return <div>Loading...</div>;
  } else if (error) {
    return <div>Error: {error.reason}</div>;
  } else if (data.length === 0) {
    return <></>;
  }

  const dateRangeInDays = pipe(
    data,
    Array.match({
      onEmpty: () => 0,
      onNonEmpty: ([first, ...rest]) =>
        pipe(
          Array.last(rest),
          Option.match({
            onNone: () => 1,
            onSome: (last) =>
              Duration.toDays(
                DateTime.distanceDuration(
                  DateTime.unsafeFromDate(last.date),
                  DateTime.unsafeFromDate(first.date)
                )
              ),
          })
        ),
    })
  );

  const sumOfDifferences = pipe(
    data,
    Array.reduce(0, (acc, _) => acc + (_.difference ?? 0))
  );

  const averageDifference = sumOfDifferences / dateRangeInDays;

  return (
    <div className="flex flex-col gap-y-4">
      <p className="text-sm font-light text-center">
        {averageDifference >= 0 ? "+" : ""}
        {`${Math.floor(averageDifference)} average in ${dateRangeInDays} days`}
      </p>

      {data.map((history) => (
        <div
          key={history.date.toISOString()}
          className="flex items-center justify-between"
        >
          <div>
            <p className="font-medium">
              {new Date(history.date).toLocaleDateString("en-US", {
                weekday: "long",
              })}
            </p>
            <p className="text-xs font-light">
              {new Date(history.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-x-4">
            {history.difference !== null && (
              <p className="text-xs font-light">
                ({history.difference >= 0 ? "+" : ""}
                {history.difference})
              </p>
            )}
            <div className="inline-flex items-center justify-end gap-x-0.5">
              <SaveInput<"primogems">
                type="number"
                name="primogems"
                defaultValue={history.primogems}
                className="w-[7rem]"
                onChange={(e) =>
                  onUpdate({
                    date: history.date,
                    primogems: e.target.value,
                  })
                }
              />
              <Primogem className="size-6" />
            </div>

            <Button
              type="submit"
              title="Delete"
              className="size-6 inline-flex items-center justify-center"
              disabled={pendingDelete}
              onClick={() => onDelete({ date: history.date })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
