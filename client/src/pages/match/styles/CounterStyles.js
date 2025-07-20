import React from "react";

export function DrawsStyle({ hidden, children }) {
  return (
    <div
      className={
        "text-center w-full font-light text-xs text-neutral-content" +
        (hidden ? " invisible" : "")
      }
    >
      {children}
    </div>
  );
}

export function WinsStyle({ children }) {
  return (
    <div className="flex justify-evenly text-center text-base-content mb-1">
      {children}
    </div>
  );
}

export function WinsSeperator({ visible }) {
  if (!visible) return;
  return <span className="inline-block text-neutral-content">{" – "}</span>;
}

export function ByeStyle({ children }) {
  return <div className="text-success italic font-thin">{children}</div>;
}

// Get Win Counter class from matchData
export const winClass = (wins, isEditing, { maxwins, isbye }) =>
  "text-base h-6 " +
  (isEditing
    ? "btn-ghost btn-circle btn-xs"
    : isbye
      ? "invisible"
      : wins && wins === maxwins
        ? "text-success p-px"
        : "p-px");

export const drawsClass = (isEditing) =>
  "font-light lowercase min-h-0 h-4" +
  (isEditing ? " btn-ghost rounded-xl btn-xs" : "");
