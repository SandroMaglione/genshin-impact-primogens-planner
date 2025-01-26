import { useActionEffect } from "../lib/hooks/use-action-effect";
import type { ProgressTable } from "../lib/schema";
import { Dexie } from "../lib/services/dexie";
import Fate from "./ui/fate";
import Label from "./ui/label";
import Primogem from "./ui/primogem";
import SaveInput from "./ui/save-input";

type FormName = "progressId" | "dailyPrimogems" | "primogems" | "fates";

export default function UpdateProgressForm({
  progress,
}: {
  progress: ProgressTable;
}) {
  const [, onChange] = useActionEffect(Dexie.changeProgress);
  return (
    <form className="flex flex-col gap-y-4">
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
              min={0}
              id="current-primogems"
              name="primogems"
              className="w-full"
              defaultValue={progress.primogems}
              onChange={(event) =>
                onChange({
                  progressId: progress.progressId,
                  primogems: event.target.value,
                })
              }
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
              min={0}
              id="current-fates"
              name="fates"
              className="w-full"
              defaultValue={progress.fates}
              onChange={(event) =>
                onChange({
                  progressId: progress.progressId,
                  fates: event.target.value,
                })
              }
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
              min={0}
              id="dailyPrimogems"
              name="dailyPrimogems"
              className="w-full"
              defaultValue={progress.dailyPrimogems}
              onChange={(event) =>
                onChange({
                  progressId: progress.progressId,
                  dailyPrimogems: event.target.value,
                })
              }
            />
          </div>
        </div>
      </div>
    </form>
  );
}
