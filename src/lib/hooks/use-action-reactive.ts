import { startTransition, useRef } from "react";
import type { TypedFormData } from "../types";

export const useActionReactive = <T extends string>(
  action: (payload: TypedFormData<T>) => void
) => {
  const formRef = useRef<HTMLFormElement>(null);
  const reactiveAction = () => {
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      startTransition(() => {
        action(formData as TypedFormData<T>);
      });
    } else {
      console.warn("Form reference is not set");
    }
  };
  return [formRef, reactiveAction] as const;
};
