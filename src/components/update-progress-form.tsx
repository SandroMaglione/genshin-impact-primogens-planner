import { Effect, Schema } from "effect";
import { useActionEffect } from "../lib/hooks/use-action-effect";
import type { ProgressTable } from "../lib/schema";
import { Dexie } from "../lib/services/dexie";
import Fate from "./fate";
import Primogem from "./primogem";
import Button from "./ui/button";
import Label from "./ui/label";
import SaveInput from "./ui/save-input";

type FormName = "progressId" | "dailyPrimogems" | "primogems" | "fates";

export default function UpdateProgressForm({
  progress,
}: {
  progress: ProgressTable;
}) {
  const [_, action, pending] = useActionEffect((formData) =>
    Effect.gen(function* () {
      const dexie = yield* Dexie;
      const query = dexie.updateProgress<FormName>(
        Schema.Struct({
          progressId: Schema.NumberFromString,
          dailyPrimogems: Schema.NumberFromString,
          fates: Schema.NumberFromString,
          primogems: Schema.NumberFromString,
        })
      );
      return yield* query(formData);
    })
  );
  return (
    <form action={action} className="flex flex-col gap-y-4">
      <input type="hidden" name="progressId" value={progress.progressId} />

      <div className="flex flex-col gap-y-2">
        <div className="grid grid-cols-2 gap-x-8">
          <div className="flex gap-x-4 items-center">
            <div className="min-w-8">
              <Label htmlFor="event-primogems">
                <Primogem className="size-8" />
              </Label>
            </div>
            <SaveInput<FormName>
              type="number"
              id="current-primogems"
              name="primogems"
              defaultValue={progress.primogems}
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
              id="current-fates"
              name="fates"
              defaultValue={progress.fates}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex gap-x-4 items-center">
          <Label
            htmlFor="event-primogems"
            className="flex items-center gap-x-1"
          >
            <Primogem className="size-8" />
            <span className="text-sm block font-light">/ day</span>
          </Label>
          <div className="flex-1">
            <SaveInput<FormName>
              type="number"
              id="dailyPrimogems"
              name="dailyPrimogems"
              className="w-full"
              defaultValue={progress.dailyPrimogems}
            />
          </div>
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        Update
      </Button>
    </form>
  );
}
