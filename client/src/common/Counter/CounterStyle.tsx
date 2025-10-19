import type { MouseEventHandler, ReactNode } from "react";

export default function CounterStyle({
  className,
  onClick,
  children,
}: {
  className?: string;
  onClick?: MouseEventHandler<HTMLSpanElement>;
  children?: ReactNode;
}) {
  return (
    <span
      className={"btn select-none " + className}
      onClick={onClick}
      unselectable="on"
    >
      {children}
    </span>
  );
}
