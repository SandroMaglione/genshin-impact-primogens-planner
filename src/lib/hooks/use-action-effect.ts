import { Effect, type ManagedRuntime } from "effect";
import { startTransition, useActionState } from "react";
import { RuntimeClient } from "../services/runtime-client";

export const useActionEffect = <P, A, E>(
  effect: (
    params: P
  ) => Effect.Effect<
    A,
    E,
    ManagedRuntime.ManagedRuntime.Context<typeof RuntimeClient>
  >
) => {
  const [state, action, pending] = useActionState<E | null, P>(
    (_, params) =>
      RuntimeClient.runPromise(
        effect(params).pipe(
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

  return [
    state,
    (payload: P) =>
      startTransition(() => {
        action(payload);
      }),
    pending,
  ] as const;
};
