import clsx from "clsx";

export default function Button({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>) {
  return (
    <button
      className={clsx(
        "text-sm font-medium border rounded-md border-grey hover:cursor-pointer hover:bg-grey/30 transition-colors duration-150",
        className
      )}
      {...props}
    />
  );
}
