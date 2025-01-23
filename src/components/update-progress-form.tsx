import { Effect, Schema } from "effect";
import { useActionEffect } from "../lib/hooks/use-action-effect";
import type { ProgressTable } from "../lib/schema";
import { Dexie } from "../lib/services/dexie";

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
    <form action={action}>
      <input type="hidden" name="progressId" value={progress.progressId} />

      <div>
        <label htmlFor="dailyPrimogems">Daily Primogems</label>
        <input
          type="number"
          id="dailyPrimogems"
          name="dailyPrimogems"
          defaultValue={progress.dailyPrimogems}
        />
      </div>
      <div>
        <label htmlFor="primogems">Primogems</label>
        <input
          type="number"
          id="primogems"
          name="primogems"
          defaultValue={progress.primogems}
        />
      </div>
      <div>
        <label htmlFor="fates">Fates</label>
        <input
          type="number"
          id="fates"
          name="fates"
          defaultValue={progress.fates}
        />
      </div>
      <button type="submit" disabled={pending}>
        Update
      </button>
    </form>
  );
}
