import type { TypedFormData } from "../../lib/types";

export default function SaveForm<T extends string = never>({
  action,
  ...props
}: Omit<
  React.DetailedHTMLProps<
    React.FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
  >,
  "action"
> & {
  action: (formData: TypedFormData<T>) => void;
}) {
  return (
    <form
      {...props}
      action={(formData) => action(formData as TypedFormData<T>)}
    />
  );
}
