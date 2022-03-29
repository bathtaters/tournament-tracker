import React from "react";
import { ModalTitleStyle } from "../../common/styles/CommonStyles";
export { ModalTitleStyle };

export const statsStyle = {
  number: (isDrop) => 'font-light text-right ' + (isDrop ? 'neg-color' : ''),
  name: (isRanked) => `col-span-${isRanked? 2:4} text-lg font-normal text-left`,
  record: "col-span-2 text-xs font-light align-middle",
  missing: "col-span-4 text-md font-thin align-middle text-center dim-color italic",
}

export function EventStatsStyle({ title, children }) {
  return (
    <div className="m-4">
      <h3 className="font-light text-center">{title}</h3>
      {children}
    </div>
  );
}

export function ViewStatsStyle({ onClick, children }) {
  const style = (onClick ? 'link' : 'hidden') + ' italic text-xs text-center font-thin block mb-2';
  return (
    <div className={style} onClick={onClick}>{children}</div>
  );
}

export function StatsRowStyle({ children }) {
  return (
    <div className="grid grid-flow-row grid-cols-5 gap-x-2 gap-y-1 items-center dim-color">
      {children}
    </div>
  );
}