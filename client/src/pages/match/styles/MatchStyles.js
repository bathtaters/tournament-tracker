import React from "react";
import { Link } from "react-router-dom";

export function MatchStyle({ children, showRaw }) {
  const height = showRaw ? 'h-64' : 'h-32';
  return (
    <div className={"m-1 shadow-lg shadow-base-300 rounded-md bg-base-100 flex justify-evenly flex-col relative "+height}>
      {children}
    </div>
  );
}

// Style to pass to DragBlock in PlayerBox
export const playerBoxStyle = "inline-block grow rounded-lg px-2 py-1 mx-2 my-1";

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
    <div className="inline-block shrink font-thin text-sm text-neutral-content p-2 align-middle pointer-events-none">
      {children}
    </div>
  );
}

export function PlayerInfoStyle({ isDrop, children }) {
  return (
    <div className="text-xs font-thin mt-0 pt-0 mb-1 relative group">
      <div className={isDrop ? "text-error" : "text-neutral-content"}>
        {children}
      </div>
    </div>
  );
}
// bg-base-focus rounded-md border border-base-content
export function PlayerDropStyle({ children, visible }) {
  if (!visible) return null;
  return (
    <div className="hidden group-hover:block hover:block absolute -bottom-1 right-0 left-0">
      {children}
    </div>
  );
}