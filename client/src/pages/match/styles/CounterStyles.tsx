import type { ReactNode } from "react";
import type { MatchData } from "types/models";

export function DrawsStyle({
  hidden,
  children,
}: {
  hidden?: boolean;
  children?: ReactNode;
}) {
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

export function WinsStyle({ children }: { children?: ReactNode }) {
  return (
    <div className="flex justify-evenly text-center text-base-content mb-1">
      {children}
    </div>
  );
}

export function WinsSeparator({ visible = true }: { visible?: boolean }) {
  if (!visible) return;
  return <span className="inline-block text-neutral-content">{" – "}</span>;
}

export function ByeStyle({ children }: { children?: ReactNode }) {
  return <div className="text-success italic font-thin">{children}</div>;
}

// Get Win Counter class from matchData
export const winClass = (
  wins: number,
  isEditing: boolean,
  { maxwins, players }: MatchData,
) =>
  "text-base h-6 " +
  (isEditing
    ? "btn-ghost btn-circle btn-xs"
    : players.length === 1
      ? "invisible"
      : wins && wins === maxwins
        ? "text-success p-px"
        : "p-px");

export const drawsClass = (isEditing: boolean) =>
  "font-light lowercase min-h-0 h-4" +
  (isEditing ? " btn-ghost rounded-xl btn-xs" : "");
