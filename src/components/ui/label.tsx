import clsx from "clsx";

export default function Label({
  className,
  ...props
}: Omit<
  React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  >,
  "htmlFor"
> & {
  htmlFor: string;
}) {
  return (
    <label className={clsx("text-sm font-medium", className)} {...props} />
  );
}
