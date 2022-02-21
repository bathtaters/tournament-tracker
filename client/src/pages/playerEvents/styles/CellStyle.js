import React from "react";

import { scheduleGridClass } from "./PlayerEventStyles";
const scheduleGridSpan = scheduleGridClass.replace('grid-cols','col-span');

export function HeaderStyle({ span, className = "", children }) {
  return (<h4 className={`${className} ${span ? 'col-span-'+span : ''}`}>{children}</h4>);
}

export function CellStyle({ span, className = "", children }) {
  return (<HeaderStyle span={span} className={'font-thin base-color ' + className}>{children}</HeaderStyle>);
}

export function NoEventsStyle() {
  return (<div className={"dim-color italic font-thin text-center my-2 "+scheduleGridSpan}>– None –</div>);
}