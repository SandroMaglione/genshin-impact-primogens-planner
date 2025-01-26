import clsx from "clsx";

export default function Button({
  className,
  error,
  ...props
}: React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & { error?: boolean }) {
  return (
    <button
      className={clsx(
        error ? "border-error text-error" : "border-grey",
        "text-sm font-medium border rounded-md hover:cursor-pointer hover:bg-grey/30 transition-colors duration-150",
        className
      )}
      {...props}
    />
  );
}
