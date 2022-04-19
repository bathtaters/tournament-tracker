import React from "react";
import { Link } from "react-router-dom";

export function MatchStyle({ children, settings }) {
  const height = settings && settings.showadvanced && settings.showrawjson ? ' h-64 ' : ' h-32 ';
  return (
    <div className={"m-1 border border-base-content rounded-md flex justify-evenly flex-col relative "+height}>
      {children}
    </div>
  );
}

// Style to pass to DragBlock in PlayerBox
export const playerBoxStyle = "inline-block group grow rounded-2xl p-2 mx-1 mb-1";

export function PlayerStyle({ children }) {
  return (
    <div className="flex justify-evenly items-center text-center">{children}</div>
  );
}

export function NameStyle({ linkTo, children }) {
  return (
    <h4 className={'mb-0 pb-0 block text-xl ' + (!linkTo ? 'pointer-events-none' : '')}>{
      linkTo ? 
        <Link className="font-light link link-hover" to={linkTo}>{children}</Link> :
        <span className="font-light" >{children}</span>
    }</h4>
  );
}

export function VsStyle({ children }) {
  return (
    <div className="inline-block shrink font-thin text-sm text-base-content p-2 align-middle pointer-events-none">
      {children}
    </div>
  );
}

export function PlayerInfoStyle({ isDrop, children }) {
  return (
    <div className="text-xs font-thin mt-0 pt-0 pointer-events-none mb-1 relative">
      <div className={isDrop ? "text-error" : "text-base-content"}>
        {children}
      </div>
    </div>
  );
}

export function PlayerDropStyle({ children, visible }) {
  if (!visible) return null;
  return (
    <div className="hidden group-hover:block hover:block absolute left-0 right-0 top-4 bg-base-focus rounded-md border border-base-content">
      {children}
    </div>
  );
}