import type { ReactNode, ButtonHTMLAttributes, CSSProperties } from "react";
import { Fragment } from "react";
import ClockIcon from "../../../common/icons/ClockIcon";
import ReloadIcon from "../../../common/icons/ReloadIcon";
import { PauseIcon, PlayIcon } from "../../../common/icons/PausePlayIcons";

export const buttonIcons: Record<string, ReactNode> = {
  run: <PlayIcon className="fill-primary-content" />,
  pause: <PauseIcon className="fill-primary-content" />,
  reset: <ReloadIcon className="fill-primary-content" />,
};

export const ClockWrapper = ({
  isRed,
  children,
}: {
  isRed?: boolean;
  children?: ReactNode;
}) => (
  <div
    className={`fixed bottom-4 right-4 z-50 flex flex-col items-center ${
      isRed
        ? "bg-error text-error-content"
        : "bg-secondary text-secondary-content"
    } rounded-box p-2 text-xs md:text-base`}
  >
    <ClockIcon className="w-5 fill-current" />
    {children}
  </div>
);

export const ButtonsWrapper = ({ children }: { children?: ReactNode }) => (
  <div className="grid grid-cols-2 gap-2 m-2">{children}</div>
);

export const ClockStyle = ({
  timer,
  paused,
}: {
  timer: string[];
  paused?: boolean;
}) => (
  <span
    className={`countdown font-mono text-2xl md:text-4xl ${paused ? "animate-pulse-pause" : "opacity-80"}`}
  >
    {timer.map((value, idx) => (
      <Fragment key={`${idx}num`}>
        {idx !== 0 && ":"}
        <span style={{ "--value": value } as CSSProperties} />
      </Fragment>
    ))}
  </span>
);

export const ButtonStyle = ({
  icon,
  ...props
}: { icon?: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    className="btn btn-square btn-sm md:btn-md btn-primary"
    {...props}
  >
    {icon}
  </button>
);
