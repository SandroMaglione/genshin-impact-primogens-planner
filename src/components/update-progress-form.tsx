import { useActionEffect } from "../lib/hooks/use-action-effect";
import type { ProgressTable } from "../lib/schema";
import { Dexie } from "../lib/services/dexie";
import Fate from "./ui/fate";
import GenesisCrystal from "./ui/genesis-crystal";
import Label from "./ui/label";
import Primogem from "./ui/primogem";
import SaveInput from "./ui/save-input";

type FormName =
  | "targetFates"
  | "progressId"
  | "dailyPrimogems"
  | "primogems"
  | "fates"
  | "genesisCrystals";

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
          <div id="tut-target-fates" className="flex gap-x-4 items-center">
            <div className="min-w-8">
              <Label htmlFor="target-fates">
                <div className="flex flex-col">
                  <Fate className="size-6" />
                  <span className="text-xs font-light">Goal</span>
                </div>
              </Label>
            </div>
            <SaveInput<FormName>
              type="number"
              min={0}
              id="target-fates"
              name="targetFates"
              className="w-full"
              defaultValue={progress.fatesGoal}
              onChange={(event) =>
                onChange({
                  progressId: progress.progressId,
                  fatesGoal: event.target.value,
                })
              }
            />
          </div>

          <div id="tut-current-fates" className="flex gap-x-4 items-center">
            <div className="min-w-8">
              <Label htmlFor="current-fates">
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

        <div className="grid grid-cols-2 gap-x-8">
          <div id="tut-current-primogems" className="flex gap-x-4 items-center">
            <div className="min-w-8">
              <Label htmlFor="current-primogems">
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

          <div
            id="tut-current-genesis-crystals"
            className="flex gap-x-4 items-center"
          >
            <div className="min-w-8">
              <Label htmlFor="current-genesis-crystals">
                <GenesisCrystal className="size-8" />
              </Label>
            </div>
            <SaveInput<FormName>
              type="number"
              min={0}
              id="current-genesis-crystals"
              name="fates"
              className="w-full"
              defaultValue={progress.genesisCrystals}
              onChange={(event) =>
                onChange({
                  progressId: progress.progressId,
                  genesisCrystals: event.target.value,
                })
              }
            />
          </div>
        </div>
      </div>
    </form>
  );
}
