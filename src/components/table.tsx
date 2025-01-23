import clsx from "clsx";

const Th = ({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.ThHTMLAttributes<HTMLTableHeaderCellElement>,
  HTMLTableHeaderCellElement
>) => {
  return <th className={clsx("pt-2 pb-3", className)} {...props} />;
};

const Td = ({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.TdHTMLAttributes<HTMLTableDataCellElement>,
  HTMLTableDataCellElement
>) => {
  return <td className={clsx("py-2", className)} {...props} />;
};

export { Td, Th };
