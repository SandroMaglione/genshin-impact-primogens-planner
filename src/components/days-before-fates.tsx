import { DateTime } from "effect";
import { useActionEffect } from "../lib/hooks/use-action-effect";
import type { ProgressTable } from "../lib/schema";
import { Dexie } from "../lib/services/dexie";
import TargetForm from "./target-form";
import Fate from "./ui/fate";
import SaveInput from "./ui/save-input";

type FormName = "fatesGoal" | "progressId";

export default function DaysBeforeFates({
  currentProgress,
  today,
}: {
  today: DateTime.Utc;
  currentProgress: ProgressTable;
}) {
  const [_, onChange] = useActionEffect(Dexie.updateFatesGoal);
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center gap-x-4 text-xl font-light">
        <label htmlFor="goal">Reaching</label>{" "}
        <div id="tut-target-fates" className="inline-flex items-center gap-x-1">
          <SaveInput<FormName>
            type="number"
            id="goal"
            name="fatesGoal"
            className="max-w-[6rem]"
            value={currentProgress.fatesGoal}
            onChange={(event) =>
              onChange({
                progressId: currentProgress.progressId,
                fatesGoal: event.target.value,
              })
            }
          />{" "}
          <Fate className="size-6" />
        </div>
      </div>

      <TargetForm currentProgress={currentProgress} today={today} />
    </div>
  );
}
