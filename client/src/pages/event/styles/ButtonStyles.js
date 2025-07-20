import React from "react";
import EditIcon from "../../common/icons/EditIcon";
import CopyIcon from "../../common/icons/CopyIcon";
import SeatIcon from "../../common/icons/SeatIcon";

export function RoundButton({ value, onClick }) {
  return (
    <div className="text-center my-4">
      <input
        disabled={!onClick}
        onClick={onClick}
        type="button"
        value={value}
        className="btn btn-primary btn-wide btn-md sm:btn-lg"
      />
    </div>
  );
}

export function EditEventButton({ onClick }) {
  return (
    <div className="stat-figure">
      <button
        type="button"
        className="btn btn-secondary btn-sm btn-square"
        onClick={onClick}
      >
        <EditIcon className="h-4 w-4 stroke-current" />
      </button>
    </div>
  );
}

export function CopyRoundButton({ onClick, isSeat }) {
  return (
    <button
      type="button"
      className="btn btn-xs btn-square btn-ghost opacity-40"
      onClick={onClick}
    >
      {isSeat ? <SeatIcon /> : <CopyIcon />}
    </button>
  );
}

export const CreditButtonWrapper = ({ children }) => (
  <div className="flex justify-center items-center gap-4 p-8">{children}</div>
);

export const CreditButton = (props) => (
  <button className="btn btn-primary btn-outline btn-square" {...props}>
    {!props.disabled ? (
      props.children
    ) : (
      <span className="loading loading-ball loading-xs" />
    )}
  </button>
);
