import React from "react";
import { Link } from "react-router-dom";

import { statusInfo } from '../../../assets/strings';

// DAY.JS STYLES \\

export function DayTitleStyle({ className, children }) {
  return (<h4 className={'text-2xl font-light text-center pointer-events-none ' + className}>{children}</h4>);
}

export function DaySubtitleStyle({ children }) {
  return (<h5 className="text-center italic text-sm font-thin mb-2 pointer-events-none">{children}</h5>);
}

export function MissingDataStyle({ children }) {
  return (<div className="text-center text-sm font-light dim-color italic pointer-events-none opacity-60">{children}</div>)
}


// DAY-ENTRY.JS STYLES \\

function BaseTitleStyle({ status, className = '', children }) {
  const statusClass = status === 1 ? '' : statusInfo[status + 1].class;
  return (<div className={statusClass+' text-sm font-normal block '+className}>{children}</div>);
}

export function EntryTitleStyle({ status, children }) {
  return (
    <div className="link pointer-events-none">
      <BaseTitleStyle status={status}>{children}</BaseTitleStyle>
    </div>
  );
}

export function EntryLinkStyle({ to, status, children }) {
  return (
    <Link to={to}>
      <BaseTitleStyle status={status}>{children}</BaseTitleStyle>
    </Link>
  );
}


// Other \\

export function EditEventButton({ status, onClick, children }) {
  return (<div
    className={'absolute top-0 right-1 text-sm font-normal cursor-pointer hover:'+statusInfo[status].class}
    onClick={onClick}
  >
    {"✐"}
  </div>);
}

export const dragAndDropClass = {
  outer: "p-2 m-1 rounded-md w-40 min-h-32",
  inner: "relative flex justify-center items-center overflow-hidden m-1 h-8 rounded-xl",
};