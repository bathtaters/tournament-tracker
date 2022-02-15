import React from "react";
import { Link } from "react-router-dom";

import { statusInfo } from '../../../assets/strings';

// DAY.JS STYLES \\

export function TitleStyle({ className, children }) {
  return (<h4 className={'text-2xl font-light text-center pointer-events-none ' + className}>{children}</h4>);
}

export function SubTitleStyle({ children }) {
  return (<h5 className="text-center italic text-sm font-thin mb-2 pointer-events-none">{children}</h5>);
}

export function MissingDataStyle({ children }) {
  return (<div className="text-center text-sm font-light dim-color italic pointer-events-none opacity-60">{children}</div>)
}


// DAY-ENTRY.JS STYLES \\

export function EntryTitleStyle({ isDone, children }) {
  return (
    <div className={'text-sm font-normal pointer-events-none '+(isDone ? 'dim-color' : 'link-color')}>
      {children}
    </div>
  );
}

export function EntryLinkStyle({ to, status, children }) {
  const statusClass = status === 1 ? '' : statusInfo[status + 1].class;
  return (
    <Link to={to} className={'text-sm font-normal block '+statusClass}>
      {children}
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
  inner: "relative p-1 m-1 rounded-xl text-center",
};