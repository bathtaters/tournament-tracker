import React from "react";
import { ModalTitleStyle } from "../../common/styles/CommonStyles";
import { statusInfo } from "../../../assets/strings";

export function TitleStyle({ isNew }) {
  return (<ModalTitleStyle>{isNew ? 'New Event' : 'Edit Event'}</ModalTitleStyle>);
}

export function StatusStyle({ status }) {
  return (
    <h5 className="text-center mb-2">
      <span className="mr-1">Status:</span>
      <span className={"font-thin "+statusInfo[status].class}>{statusInfo[status].label}</span>
    </h5>
  );
}