import { Effect, type ManagedRuntime } from "effect";
import { useActionState } from "react";
import { RuntimeClient } from "../services/runtime-client";
import type { TypedFormData } from "../types";

export const useActionEffect = <R extends string, A, E>(
  effect: (
    formData: TypedFormData<R>
  ) => Effect.Effect<
    A,
    E,
    ManagedRuntime.ManagedRuntime.Context<typeof RuntimeClient>
  >
) => {
  return useActionState<E | null, TypedFormData<R>>(
    (_, formData) =>
      RuntimeClient.runPromise(
        effect(formData).pipe(
          Effect.match({
            onFailure: (error) => {
              console.error(error);
              return error;
            },
            onSuccess: (value) => {
              console.log(value);
              return null;
            },
          })
        )
      ),
    null
  );
};
