import React from "react"
import PropTypes from 'prop-types'

import LockIcon from "../icons/LockIcon"
import WarningIcon from "../icons/WarningIcon"

// Input Element
export const elementDefaults = {
  className:  "font-light mx-1 sm:mx-4",
  labelClass: "whitespace-nowrap",
  inputWrapperClass: "flex",
  inputClass: "",
  buttonClass: "btn-primary mx-1 sm:mx-4",
}
export const typeDefaults = {
  text: 'input input-bordered w-full invalid:input-warning',
  date: 'input input-bordered w-full invalid:input-warning',
  number: 'input input-bordered w-full invalid:input-warning p-1 text-center hide-arrows',
  numberSize: 'w-12 sm:w-16'
}

// Form wrapper
export function FormContainer({ onSubmit, children }) {
  return (<form onSubmit={onSubmit}>{children}</form>)
}

// Error Banner
export function FormErrorStyle({ children }) {
  return (
    <div className="alert alert-warning shadow-lg">
      <div>
        <WarningIcon className="stroke-current flex-shrink-0 h-6 w-6" />
        <span>{children}</span>
      </div>
    </div>
  )
}

// Row/Column wrapper
export function RowStyle({ isRow, children }) {
  return (
    <div className={`m-1 flex justify-start ${isRow ? "flex-row flex-wrap" : "flex-col"}`}>
      {children}
    </div>
  );
}

// Input Element wrapper
export function ElementStyle({ isFragment, isLabel, className, children }) {
  if (isLabel) return (<label className={'label '+className}>{children}</label>);
  if (isFragment) return (<>{children}</>);
  return (<div className={className}>{children}</div>);
}

// Apply Disabled Lock to Input Elements
export function InputStyle({ disabled, className, children }) {
  return (
    <label className={(disabled ? "input-group " : "") + className}>
      { children }
      { disabled && <span className="bg-base-200 text-secondary"><LockIcon /></span> }
    </label>
  )
}

// Input Form Buttons
export function ButtonContainer({ children }) {
  return (<div className="mt-4 w-full flex justify-center items-baseline flex-wrap">{children}</div>);
}

export function ButtonElement({ label, onClick, className = elementDefaults.buttonClass, isSubmit = false }) {
  return (
    <input
      className={'btn '+className}
      value={label}
      type={isSubmit ? "submit" : "button"}
      onClick={onClick}
      key={label}
    />
  );
}

// Button Validation
ButtonElement.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  isSubmit: PropTypes.bool,
};