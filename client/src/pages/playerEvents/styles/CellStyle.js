import React from "react";

import { scheduleGridClass } from "./PlayerEventStyles";
const scheduleGridSpan = scheduleGridClass.replace('grid-cols','col-span');

export function HeaderStyle({ span, children }) {
  return (<h4 className={span ? 'col-span-'+span : ''}>{children}</h4>);
}

export function NoEventsStyle() {
  return (<div className={"dim-color italic font-thin text-center my-2 "+scheduleGridSpan}>– None –</div>);
}

export function CellStyle({ span, className = "", children, ...props }) {
  return (
    <h4 className={'font-thin base-color ' + className + (span ? ' col-span-'+span : '')} {...{props}}>
        {children}
    </h4>
  );
}