import clsx from "clsx";

export default function SaveInput<Name extends string = never>({
  className,
  ...props
}: Omit<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  "name"
> & {
  name: NoInfer<Name>;
}) {
  return (
    <input
      className={clsx("border border-grey bg-white px-3 py-2", className)}
      {...props}
    />
  );
}
