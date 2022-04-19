import React from "react";

export function PlayerEditorStyle({ playerCount, children }) {
  return (
  <div className="m-4">
    <label className="label label-text mb-2">{'Players' + (typeof playerCount !== 'number' ? '' : ` (${playerCount})`)}</label>
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

// Classes to send to SuggestText
export const suggestClass = {
  box: "align-middle w-40 input-sm",
  spacer: "align-middle",
}