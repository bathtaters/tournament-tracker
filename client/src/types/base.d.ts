import type { Match, Player } from "./models";

export type AlertButton = {
  /** Unique ID (Default = Label then Value) */
  id?: string;
  /** User Label (Default = ID then Value) */
  label?: string;
  /** Value (Default = ID then Label) */
  value: string;
  /** Unique React element key (Default = ID then Value then Label) */
  key?: string;
} & Partial<HTMLInputElement>;

export type AlertState = {
  /** Header text */
  title?: string;
  /** Body text */
  message?: string;
  /** List of buttons */
  buttons?: (string | AlertButton)[];
  /** Classes added to alert modal */
  className?: string;
  /** - ***true***: Always show the close-window button.
   *  - ***false***: Only shows it when there are no buttons */
  showClose?: boolean;
  /** Return this value when closed via <Esc> (Default: defaultResult)
   *  - ***false***: Disable the <Esc> key for the alert window */
  escValue?: false | string;
  /** Default response to return when the alert is closed */
  defaultResult: string;
  /** Current state of the alert modal */
  isOpen: boolean;
  /** Result from the last execution */
  result?: string | undefined;
};

export type AlertOptions = Partial<
  Pick<AlertState, "title" | "message" | "buttons" | "className" | "showClose">
>;

export type SwapDragData = {
  id: Match["id"];
  playerid: Player["id"];
  reported?: boolean;
};
