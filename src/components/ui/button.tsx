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
        "text-sm font-medium bg-grey w-full py-2 hover:cursor-pointer hover:bg-grey/80",
        className
      )}
      {...props}
    />
  );
}
