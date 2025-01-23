import { Effect, Schema } from "effect";
import { useActionEffect } from "../lib/hooks/use-action-effect";
import { Dexie } from "../lib/services/dexie";
import Fate from "./fate";
import Primogem from "./primogem";

type FormName = "name" | "fates" | "primogems" | "date";

export default function AddEventForm() {
  const [_, action, pending] = useActionEffect((formData) =>
    Effect.gen(function* () {
      const dexie = yield* Dexie;
      const query = dexie.addEvent<FormName>(
        Schema.Struct({
          name: Schema.String,
          date: Schema.String,
          fates: Schema.NumberFromString,
          primogems: Schema.NumberFromString,
        })
      );
      return yield* query(formData);
    })
  );
  return (
    <form action={action}>
      <div>
        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" />
      </div>
      <div>
        <label htmlFor="date">Date</label>
        <input type="date" id="date" name="date" />
      </div>
      <div>
        <label htmlFor="primogems">
          <Primogem className="size-8" />
        </label>
        <input type="number" id="primogems" name="primogems" />
      </div>
      <div>
        <label htmlFor="fates">
          <Fate className="size-8" />
        </label>
        <input type="number" id="fates" name="fates" />
      </div>
      <button type="submit" disabled={pending}>
        Add
      </button>
    </form>
  );
}
