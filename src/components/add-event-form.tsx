import { useActionEffect } from "../lib/hooks/use-action-effect";
import { Dexie } from "../lib/services/dexie";
import Button from "./ui/button";
import Fate from "./ui/fate";
import Label from "./ui/label";
import Primogem from "./ui/primogem";
import SaveForm from "./ui/save-form";
import SaveInput from "./ui/save-input";

type FormName = "fates" | "primogems" | "date";

export default function AddEventForm() {
  const [_, action, pending] = useActionEffect(Dexie.addEvent);
  return (
    <SaveForm<FormName> action={action} className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-y-2">
        <SaveInput<FormName>
          type="date"
          aria-label="Event date"
          id="date"
          name="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          className="w-full"
        />

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

      <Button
        type="submit"
        disabled={pending}
        className="w-full py-2 inline-flex items-center justify-center gap-x-2"
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
        <span>Add event</span>
      </Button>
    </SaveForm>
  );
}
