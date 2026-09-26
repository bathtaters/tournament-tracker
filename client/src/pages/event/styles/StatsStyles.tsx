import type { ReactNode, MouseEventHandler } from "react";
import { ModalTitleStyle } from "../../../common/General/styles/CommonStyles";

export { ModalTitleStyle };

export const statsStyle = {
  record: "col-span-2 text-xs font-light align-middle",
  missing:
    "col-span-4 text-md font-thin align-middle text-center opacity-90 italic",

  number: (isDrop = false) =>
    "font-light text-right " + (isDrop ? "text-error" : ""),

  name: (isRanked = false, disableLink = false, tooltip = false) =>
    `${isRanked ? "col-span-2" : "col-span-4"} text-lg font-normal text-left ${
      disableLink ? "cursor-default" : "link link-hover"
    }${tooltip ? " tooltip" : ""}`,
};

export function EventStatsStyle({
  title,
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className="p-4">
      <h3 className="font-light text-center">{title}</h3>
      {children}
    </div>
  );
}

export function ViewStatsStyle({
  onClick,
  children,
}: {
  onClick?: MouseEventHandler<HTMLDivElement>;
  children?: ReactNode;
}) {
  const style =
    (onClick ? "link link-hover link-secondary" : "hidden") +
    " italic text-xs text-center font-thin block mb-2";
  return (
    <div className={style} onClick={onClick ?? undefined}>
      {children}
    </div>
  );
}

export function StatsRowStyle({ children }: { children?: ReactNode }) {
  return (
    <div className="grid grid-flow-row grid-cols-5 gap-x-2 gap-y-1 items-center">
      {children}
    </div>
  );
}
