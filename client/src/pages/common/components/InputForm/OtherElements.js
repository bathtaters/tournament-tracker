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

export function ElementLabel({ id, label, className }) {
  if (!label) return null;
  return (<label className={className} htmlFor={id}>{label}</label>);
}

export function ElementInput({ inputProps = {}, className }) {
  if (inputProps.type === 'number') inputProps.pattern = "\\d*";
  return (<input {...inputProps} className={className} />);
}