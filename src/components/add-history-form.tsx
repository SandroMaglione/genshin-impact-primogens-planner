import { useActionEffect } from "../lib/hooks/use-action-effect";
import type { ProgressTable } from "../lib/schema";
import { Dexie } from "../lib/services/dexie";
import Button from "./ui/button";
import Label from "./ui/label";
import Primogem from "./ui/primogem";
import SaveForm from "./ui/save-form";
import SaveInput from "./ui/save-input";

type FormName = "primogems" | "date";

export default function AddHistoryForm({
  currentProgress,
}: {
  currentProgress: ProgressTable;
}) {
  const [error, action, pending] = useActionEffect(Dexie.addHistory);
  return (
    <SaveForm<FormName> action={action} className="flex flex-col gap-y-4">
      <div className="grid grid-cols-2 items-center gap-x-8">
        <SaveInput<FormName>
          type="date"
          aria-label="Date"
          id="date"
          name="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          className="w-full"
        />

        <div className="flex gap-x-4 items-center">
          <div className="min-w-8">
            <Label htmlFor="history-primogems">
              <Primogem className="size-8" />
            </Label>
          </div>
          <SaveInput<FormName>
            type="number"
            min={0}
            id="history-primogems"
            name="primogems"
            defaultValue={currentProgress.primogems}
            className="w-full"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full py-2 inline-flex items-center justify-center gap-x-2"
        error={error !== null}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        <span>Add history</span>
      </Button>
    </SaveForm>
  );
}
