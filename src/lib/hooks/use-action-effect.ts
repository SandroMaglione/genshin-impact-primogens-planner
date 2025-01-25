import { Effect, type ManagedRuntime } from "effect";
import { useActionState } from "react";
import { RuntimeClient } from "../services/runtime-client";

export const useActionEffect = <A, E>(
  effect: (
    formData: FormData
  ) => Effect.Effect<
    A,
    E,
    ManagedRuntime.ManagedRuntime.Context<typeof RuntimeClient>
  >
) => {
  return useActionState(
    (_: E | null, formData: FormData) =>
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
