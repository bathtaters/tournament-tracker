import React from "react";
import NumberPicker from "./NumberPicker";
import RangeSelector from "./RangeSelector";
import { RowStyle, InputStyle } from "../../styles/InputFormStyles"

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

export function ElementInput({ inputProps = {}, backend, className, wrapperClass }) {
  if (inputProps.type === 'number' && !inputProps.disabled)
    return <NumberPicker inputProps={inputProps} backend={backend} className={className} wrapperClass={wrapperClass} />;

  if (inputProps.type === 'range' && !inputProps.disabled)
    return <RangeSelector {...inputProps} className={className} wrapperClass={wrapperClass} />;

  return (
    <InputStyle disabled={inputProps.disabled} className={wrapperClass}>
      <input {...inputProps} className={className} />
    </InputStyle>
  );
}