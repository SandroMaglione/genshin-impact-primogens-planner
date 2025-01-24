import { Effect, Schema } from "effect";
import { useActionEffect } from "../lib/hooks/use-action-effect";
import type { ProgressTable } from "../lib/schema";
import { Dexie } from "../lib/services/dexie";
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
        <div>
          <Label htmlFor="dailyPrimogems">Daily Primogems</Label>
          <SaveInput<FormName>
            type="number"
            id="dailyPrimogems"
            name="dailyPrimogems"
            className="w-full"
            defaultValue={progress.dailyPrimogems}
          />
        </div>
        <div>
          <Label htmlFor="primogems">Primogems</Label>
          <SaveInput<FormName>
            type="number"
            id="primogems"
            name="primogems"
            className="w-full"
            defaultValue={progress.primogems}
          />
        </div>
        <div>
          <Label htmlFor="fates">Fates</Label>
          <SaveInput<FormName>
            type="number"
            id="fates"
            name="fates"
            className="w-full"
            defaultValue={progress.fates}
          />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        Update
      </Button>
    </form>
  );
}
