import React from "react";

export function PlayerEditorStyle({ label, playerCount, children }) {
  return (
  <div className="m-4 w-full">
    <label className="label label-text mb-2">{label + (typeof playerCount !== 'number' ? '' : ` (${playerCount})`)}</label>
    { children }
  </div> 
  );
}

export function PlayerRowStyle({ children }) {
  return (<div className="min-w-48 my-1">{ children }</div>);
}

export function PlayerNameStyle({ isMissing, children }) {
  return (
    <span className={"align-middle"+(isMissing ? " italic opacity-90" : "")}>
      { children }
    </span>
  );
}

export function SuggestTextSpacer() {
  return <span className="align-middle" />
}