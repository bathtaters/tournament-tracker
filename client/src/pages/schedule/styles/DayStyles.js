import React from "react";
import { Link } from "react-router-dom";

import { statusInfo } from '../../../assets/constants';

// DAY.JS STYLES \\

export function DayTitleStyle({ className, children }) {
  return (<h4 className={'text-2xl font-light text-center pointer-events-none ' + className}>{children}</h4>);
}

export function DaySubtitleStyle({ children }) {
  return (<h5 className="text-center italic text-sm font-thin mb-2 pointer-events-none">{children}</h5>);
}

export function MissingDataStyle({ children }) {
  return (<div className="text-center text-sm font-light text-base-content opacity-90 italic pointer-events-none">{children}</div>)
}


// DAY-ENTRY.JS STYLES \\

function BaseTitleStyle({ status, children }) {
  return (
    <div className={`${statusInfo[status].textClass} text-sm font-normal break-words text-center line-clamp-2 leading-none`}>
      {children}
    </div>
  );
}

export function EntryTitleStyle({ status, children }) {
  return (
    <div className="pointer-events-none w-full">
      <BaseTitleStyle status={status}>{children}</BaseTitleStyle>
    </div>
  );
}

export function EntryLinkStyle({ to, status, children }) {
  return (
    <Link to={to} className="w-full link link-hover">
      <BaseTitleStyle status={status}>{children}</BaseTitleStyle>
    </Link>
  );
}


// Other \\

export function EditEventButton({ status, onClick, children }) {
  return (<div
    className={'absolute top-0 right-1 text-sm font-normal cursor-pointer hover:'+statusInfo[status].textClass}
    onClick={onClick}
  >
    {"✐"}
  </div>);
}

export const dragAndDropClass = {
  outer: "p-2 m-1 rounded-md w-40 min-h-32",
  inner: "relative flex justify-center items-center overflow-hidden h-9 m-1 px-2 rounded-xl",
};