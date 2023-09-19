import React from "react";
import { Link } from "react-router-dom";

import { statusInfo } from '../../../assets/constants';
import EditIcon from "../../common/icons/EditIcon";

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

const baseEntryClass = 'w-full text-sm font-normal text-center break-words line-clamp-2 leading-none'

export function EntryTitleStyle({ status, children }) {
  return (
    <div className={`${baseEntryClass} ${statusInfo[status].textClass} pointer-events-none`}>
      {children}
    </div>
  );
}

export function EntryLinkStyle({ to, status, children }) {
  if (!to) return (
    <div to={to} className={`${baseEntryClass} cursor-default`}>
      {children}
    </div>
  )
  return (
    <Link to={to} className={`${baseEntryClass} link link-hover ${statusInfo[status].linkClass} ${statusInfo[status].textClass}`}>
      {children}
    </Link>
  );
}

export const PlayerListStyle = ({ children }) => <ul className="font-light text-center">{children}</ul>
export const PlayerNameStyle = ({ children }) => <li>{children}</li>
export const NoPlayerStyle = () => <li className="italic opacity-60 font-thin">None</li>

// Other \\

export function EditEventButton({ status, onClick }) {
  return (
    <button
      onClick={onClick} type="button"
      className={'absolute top-0 right-0 btn btn-circle btn-xs btn-ghost '+statusInfo[status].textClass}
    >
      <EditIcon />
    </button>
  )
}
// {"✐"}
export const dragAndDropClass = {
  outer: "p-2 m-1 rounded-md w-40 min-h-32",
  inner: "relative flex justify-center items-center overflow-hidden h-9 m-1 px-2 rounded-xl",
};