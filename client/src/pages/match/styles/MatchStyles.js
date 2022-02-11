import React from "react";
import { Link } from "react-router-dom";

export function MatchStyle({ children, settings }) {
  const height = settings && settings.showadvanced && settings.showrawjson ? ' h-64 ' : ' h-32 ';
  return (
    <div className={"m-1 border dim-border rounded-md flex justify-evenly flex-col relative "+height}>
      {children}
    </div>
  );
}

// Style to pass to DragBlock in PlayerBox
export const playerBoxStyle = "inline-block grow rounded-2xl p-2 mx-1 mb-1";

export function PlayerStyle({ children }) {
  return (
    <div className="flex justify-evenly items-center text-center">{children}</div>
  );
}

export function NameStyle({ linkTo, children }) {
  return (
    <h4 className={'mb-0 pb-0 block text-xl ' + (!linkTo ? 'pointer-events-none' : '')}>{
      linkTo ? 
        <Link className="font-light" to={linkTo}>{children}</Link> :
        <span className="link-color font-light" >{children}</span>
    }</h4>
  );
}

export function VsStyle({ children }) {
  return (
    <div className="inline-block shrink font-thin text-sm dim-color p-2 align-middle pointer-events-none">
      {children}
    </div>
  );
}

export function PlayerInfoStyle({ isDrop, children }) {
  return (
    <div className="text-xs font-thin mt-0 pt-0 pointer-events-none mb-1">
      <div className={isDrop ? "neg-color" : "dim-color"}>
        {children}
      </div>
    </div>
  );
}
