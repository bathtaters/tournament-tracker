import React from "react";
import { RowStyle } from "../../styles/InputFormStyles"

// FormRow

export function RowWrapper({ isFragment = false, depth, children }) {
  if (isFragment) return (<>{children}</>);
  return (<RowStyle isRow={Boolean(depth % 2)}>{children}</RowStyle>);
}

export function Spacer({ className }) {
  return (<div className={className} />);
}

// InputElement

export function ElementLabel({ id, label, isLabel, className }) {
  if (!label) return null;
  if (isLabel) return (<label className={'label label-text '+className} htmlFor={id}>{label}</label>);
  return (<span className={'label-text '+className} htmlFor={id}>{label}</span>);
}

export function ElementInput({ inputProps = {}, className }) {
  if (inputProps.type === 'number') inputProps.pattern = "\\d*";
  return (<input {...inputProps} className={className} />);
}