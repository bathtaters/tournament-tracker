import React from "react";
import { ModalTitleStyle } from "../../../common/General/styles/CommonStyles";

export const tableHdrStyle = "text-left text-xl";

export function WrapperStyle({ children }) {
  return <div className="my-8">{children}</div>;
}

export const HeaderStyle = ({ children }) => (
  <ModalTitleStyle>{children}</ModalTitleStyle>
);

export function EventCellStyle({ title, teamName }) {
  return (
    <div className="flex flex-col leading-tight">
      <span>{title}</span>
      {teamName && (
        <span className="text-xs font-light text-neutral-content italic">
          {teamName}
        </span>
      )}
    </div>
  );
}
