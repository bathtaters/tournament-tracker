import React from "react";

export function PlayerEditorStyle({ playerCount, children }) {
  return (
  <div className="m-4">
    <h4>{'Players' + (typeof playerCount !== 'number' ? '' : ` (${playerCount})`)}</h4>
    { children }
  </div> 
  );
}

export function PlayerRowStyle({ children }) {
  return (<div className="min-w-48">{ children }</div>);
}

export function PlayerNameStyle({ isMissing, children }) {
  return (
    <span className={"align-middle"+(isMissing ? " italic dim-color" : "")}>
      { children }
    </span>
  );
}

// Classes to send to SuggestText
export const suggestClass = {
  box: "align-middle w-40",
  spacer: "align-middle",
}