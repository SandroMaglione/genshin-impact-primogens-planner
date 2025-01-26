import clsx from "clsx";
import { DateTime } from "effect";
import { useActionEffect } from "../lib/hooks/use-action-effect";
import { useEvents } from "../lib/hooks/use-events";
import { Dexie } from "../lib/services/dexie";
import Button from "./ui/button";
import Fate from "./ui/fate";
import Primogem from "./ui/primogem";
import { Td } from "./ui/table";

export default function ListEvents() {
  const { data, error, loading } = useEvents();
  const [, onDelete, pendingDelete] = useActionEffect(Dexie.deleteEvent);
  const [, onToggle, pendingToggle] = useActionEffect(Dexie.toggleEvent);

  if (loading) {
    return <div>Loading...</div>;
  } else if (error) {
    return <div>Error: {error.reason}</div>;
  }

  return (
    <table>
      <tbody>
        {data.map((event) => {
          const expired = DateTime.unsafeIsPast(
            DateTime.add({ days: 1 })(DateTime.unsafeFromDate(event.date))
          );
          const disabled = !event.isApplied || expired;
          return (
            <tr key={event.eventId}>
              <Td className={clsx(disabled && "opacity-30")}>
                <p className="font-medium">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                  })}
                </p>
                <p className="text-xs font-light">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </Td>
              <Td
                className={clsx(
                  disabled && "opacity-30",
                  "text-right font-light"
                )}
              >
                <div className="inline-flex items-center justify-end gap-x-0.5">
                  <span className="tabular-nums">{event.primogems}</span>
                  <Primogem className="size-4" />
                </div>
              </Td>
              <Td
                className={clsx(
                  disabled && "opacity-30",
                  "text-right font-light"
                )}
              >
                <div className="inline-flex items-center justify-end gap-x-0.5">
                  <span className="tabular-nums">{event.fates}</span>
                  <Fate className="size-4" />
                </div>
              </Td>
              <Td>
                <div className="flex gap-x-2 items-center justify-end">
                  <Button
                    type="submit"
                    title="Delete"
                    className="size-6 inline-flex items-center justify-center"
                    disabled={pendingDelete}
                    onClick={() => onDelete({ eventId: event.eventId })}
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
                  {!expired && (
                    <Button
                      type="submit"
                      className="size-6 inline-flex items-center justify-center"
                      title={event.isApplied ? "Disable" : "Enable"}
                      disabled={pendingToggle}
                      onClick={() =>
                        onToggle({
                          eventId: event.eventId,
                          isApplied: !event.isApplied,
                        })
                      }
                    >
                      {event.isApplied ? (
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
                            d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      ) : (
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
                            d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      )}
                    </Button>
                  )}
                </div>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
