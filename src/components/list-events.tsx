import { Effect, Schema } from "effect";
import { useActionEffect } from "../lib/hooks/use-action-effect";
import { useEvents } from "../lib/hooks/use-events";
import { Dexie } from "../lib/services/dexie";
import Fate from "./fate";
import Primogem from "./primogem";
import { Td } from "./table";

type FormNameDelete = "eventId";
type FormNameToggle = "eventId" | "isApplied";

export default function ListEvents() {
  const { data, error, loading } = useEvents();
  const [, actionDelete, pendingDelete] = useActionEffect((formData) =>
    Effect.gen(function* () {
      const dexie = yield* Dexie;
      const query = dexie.deleteEvent<FormNameDelete>(
        Schema.Struct({ eventId: Schema.NumberFromString })
      );
      return yield* query(formData);
    })
  );
  const [, actionToggle, pendingToggle] = useActionEffect((formData) =>
    Effect.gen(function* () {
      const dexie = yield* Dexie;
      const query = dexie.toggleEvent<FormNameToggle>(
        Schema.Struct({
          eventId: Schema.NumberFromString,
          isApplied: Schema.String.pipe(
            Schema.transform(Schema.Boolean, {
              decode: (from) => from === "true",
              encode: (to) => to.toString(),
            })
          ),
        })
      );
      return yield* query(formData);
    })
  );

  if (loading) {
    return <div>Loading...</div>;
  } else if (error) {
    return <div>Error: {error.reason}</div>;
  }

  return (
    <table>
      {/* <thead>
        <tr>
          <Th className="text-left">Date</Th>
          <Th>
            <div className="inline-flex items-center justify-end w-full">
              <Primogem className="size-8" />
            </div>
          </Th>
          <Th>
            <div className="inline-flex items-center justify-end w-full">
              <Fate className="size-8" />
            </div>
          </Th>
        </tr>
      </thead> */}
      <tbody>
        {data.map((event) => (
          <tr key={event.eventId}>
            <Td>
              {/* <p>{event.name}</p> */}
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
            <Td className="text-right font-light">
              <div className="inline-flex items-center justify-end gap-x-0.5">
                <span className="tabular-nums">{event.primogems}</span>
                <Primogem className="size-4" />
              </div>
            </Td>
            <Td className="text-right font-light">
              <div className="inline-flex items-center justify-end gap-x-0.5">
                <span className="tabular-nums">{event.fates}</span>
                <Fate className="size-4" />
              </div>
            </Td>
            <Td>
              <div className="flex gap-x-2 items-center justify-end">
                <form action={actionDelete}>
                  <input type="hidden" name="eventId" value={event.eventId} />
                  <button
                    type="submit"
                    disabled={pendingDelete}
                    className="bg-grey hover:bg-grey/80 size-8 inline-flex items-center rounded-lg justify-center hover:cursor-pointer"
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
                  </button>
                </form>
                <form action={actionToggle}>
                  <input type="hidden" name="eventId" value={event.eventId} />
                  <button
                    type="submit"
                    disabled={pendingToggle}
                    className="bg-grey hover:bg-grey/80 size-8 inline-flex items-center rounded-lg justify-center hover:cursor-pointer"
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
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
