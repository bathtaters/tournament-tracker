import React from "react";
import { statusInfo } from "../../../assets/strings";

export function EventTitleStyle({ isNew }) {
  return (<h3 className="font-light max-color text-center mb-2">{isNew ? 'New Event' : 'Edit Event'}</h3>);
}

export function EventStatusStyle({ status }) {
  return (
    <h5 className="text-center mb-2">
      <span className="mr-1">Status:</span>
      <span className={"font-thin "+statusInfo[status].class}>{statusInfo[status].label}</span>
    </h5>
  );
}