import React from "react";
import { ModalTitleStyle } from "../../common/styles/CommonStyles";
export { ModalTitleStyle };

export const statsStyle = {
  number: (isDrop) => 'font-light text-right ' + (isDrop ? 'text-error' : ''),
  name: (isRanked) => `col-span-${isRanked? 2:4} text-lg font-normal text-left link link-hover`,
  record: "col-span-2 text-xs font-light align-middle",
  missing: "col-span-4 text-md font-thin align-middle text-center opacity-90 italic",
}

export function EventStatsStyle({ title, children }) {
  return (
    <div className="p-4">
      <h3 className="font-light text-center">{title}</h3>
      {children}
    </div>
  );
}

export function ViewStatsStyle({ onClick, children }) {
  const style = (onClick ? 'link link-hover link-secondary' : 'hidden') + ' italic text-xs text-center font-thin block mb-2';
  return (
    <div className={style} onClick={onClick}>{children}</div>
  );
}

export function StatsRowStyle({ children }) {
  return (
    <div className="grid grid-flow-row grid-cols-5 gap-x-2 gap-y-1 items-center">
      {children}
    </div>
  );
}