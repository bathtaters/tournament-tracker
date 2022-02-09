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

export function PlayerStyle({ children }) {
  return (
    <div className="flex justify-evenly items-center text-center">{children}</div>
  );
}

// Style to pass to DragBlock in PlayerBox
export const playerBoxStyle = "inline-block grow rounded-2xl p-2 mx-1 mb-1";

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

export function DrawsStyle({ children, hidden }) {
  return (
    <div className={'text-center w-full font-light text-xs base-color -mt-1'+(hidden ? ' invisible' : '')}>
      {children}
    </div>
  );
}

export function WinsStyle({ children }) {
  return (
    <div className="flex justify-evenly text-center base-color mb-2">{children}</div>
  );
}

export function ByeStyle({ children }) {
  return <div className="pos-color italic font-thin">{children}</div>
}

// Get Win Counter class from matchData
export const winClass = (wins, isEditing, {maxwins, isbye}) => 
  'text-base'+
  (isEditing || !isbye ? '' : ' invisible')+
  (wins && wins === maxwins ? ' pos-color' : '');


export function ReportTitleStyle({ children }) {
  return (
    <h3 className="font-light max-color text-center mb-4">{children}</h3>
  );
}

export const reportStyles = {
  form: "grid grid-cols-3 grid-flow-row gap-2 items-center my-8",
  wins: "text-base sm:text-xl font-medium mx-2 text-right",
  drop: "ml-1 dim-color",
  draw: "text-base sm:text-xl font-light mx-2 text-right",
  dropInput: "text-xs sm:text-base font-thin mx-2",
}