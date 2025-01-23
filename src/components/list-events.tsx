import { Effect, Schema } from "effect";
import { useActionEffect } from "../lib/hooks/use-action-effect";
import { useEvents } from "../lib/hooks/use-events";
import { Dexie } from "../lib/services/dexie";
import Fate from "./fate";
import Primogem from "./primogem";

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
      <thead>
        <tr>
          <th className="text-left">Date</th>
          <th>
            <Primogem className="size-8" />
          </th>
          <th>
            <Fate className="size-8" />
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((event) => (
          <tr key={event.eventId}>
            <td>
              <p>{event.name}</p>
              <p>
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                })}
              </p>
              <p>
                {new Date(event.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </td>
            <td>{event.primogems}</td>
            <td>{event.fates}</td>
            <td>
              <form action={actionDelete}>
                <input type="hidden" name="eventId" value={event.eventId} />
                <button
                  type="submit"
                  disabled={pendingDelete}
                  className="hover:cursor-pointer"
                >
                  Delete
                </button>
              </form>
              <form action={actionToggle}>
                <input type="hidden" name="eventId" value={event.eventId} />
                <button
                  type="submit"
                  disabled={pendingToggle}
                  className="hover:cursor-pointer"
                >
                  {event.isApplied ? "Unapply" : "Apply"}
                </button>
              </form>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
