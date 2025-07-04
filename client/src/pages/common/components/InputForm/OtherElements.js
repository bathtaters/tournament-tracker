import NumberPicker from "./NumberPicker";
import RangeSelector from "./RangeSelector";
import TimePicker from "./TimePicker";
import { RowStyle, elementDefaults, typeDefaults } from "../../styles/InputFormStyles"

export const defaultInputType = 'text' // Default <input> "type" attribute

// FormRow

export function RowWrapper({ isFragment = false, depth, children }) {
  if (isFragment) return (<>{children}</>);
  return (<RowStyle isRow={Boolean(depth % 2)}>{children}</RowStyle>);
}

export function Spacer({ className }) {
  return (<div className={className} />);
}

// InputElement

export function ElementInput({ inputProps = {}, className, wrapperClass }) {
  const inputClass = `${
    typeDefaults[inputProps.type || defaultInputType] ?? inputProps.type ?? ""
  } ${
    className ?? elementDefaults.inputClass
  }`

  if (inputProps.type === 'number')
    return <NumberPicker inputProps={inputProps} className={inputClass} wrapperClass={wrapperClass} />;

  if (inputProps.type === 'range')
    return <RangeSelector inputProps={inputProps} className={inputClass} wrapperClass={wrapperClass} />;

  if (inputProps.type === 'time')
    return <TimePicker inputProps={inputProps} className={inputClass} wrapperClass={wrapperClass} />

  return <input {...inputProps} className={`join-item ${inputClass}`} />
}