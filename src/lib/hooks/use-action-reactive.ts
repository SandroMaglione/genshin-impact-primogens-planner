import { startTransition, useRef } from "react";

export const useActionReactive = (action: (payload: FormData) => void) => {
  const formRef = useRef<HTMLFormElement>(null);
  const reactiveAction = () => {
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      startTransition(() => {
        action(formData);
      });
    } else {
      console.warn("Form reference is not set");
    }
  };
  return [formRef, reactiveAction] as const;
};
