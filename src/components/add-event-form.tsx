import { Effect, Schema } from "effect";
import { useActionEffect } from "../lib/hooks/use-action-effect";
import { Dexie } from "../lib/services/dexie";
import Fate from "./fate";
import Primogem from "./primogem";
import Button from "./ui/button";
import Label from "./ui/label";
import SaveInput from "./ui/save-input";

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
    <form action={action} className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-y-2">
        <div>
          <Label htmlFor="date">Date</Label>
          <SaveInput<FormName>
            type="date"
            id="date"
            name="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-x-8">
          <div className="flex gap-x-4 items-center">
            <div className="min-w-8">
              <Label htmlFor="event-primogems">
                <Primogem className="size-8" />
              </Label>
            </div>
            <SaveInput<FormName>
              type="number"
              id="event-primogems"
              name="primogems"
              defaultValue={0}
              className="w-full"
            />
          </div>
          <div className="flex gap-x-4 items-center">
            <div className="min-w-8">
              <Label htmlFor="event-fates">
                <Fate className="size-8" />
              </Label>
            </div>
            <SaveInput<FormName>
              type="number"
              id="event-fates"
              name="fates"
              defaultValue={0}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        Add
      </Button>
    </form>
  );
}
