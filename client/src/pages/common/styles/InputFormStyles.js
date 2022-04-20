import React from "react";
import PropTypes from 'prop-types';

// Input Element
export const elementDefaults = {
  className:  "font-light mx-1 sm:mx-4",
  labelClass: "whitespace-nowrap",
  inputClass: "",
  buttonClass: "btn-primary mx-1 sm:mx-4",
}

// Form wrapper
export function FormContainer({ onSubmit, children }) {
  return (<form onSubmit={onSubmit}>{children}</form>)
}

// Row/Column wrapper
export function RowStyle({ isRow, children }) {
  return (
    <div className={`m-1 flex justify-start items-baseline flex-${isRow ? "row flex-wrap" : "col"}`}>
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
export function InputStyle({ disabled, children }) {
  return (
    <label className={disabled ? "input-group" : ""}>
      { children }
      { disabled && <span className="bg-base-200">🔒</span> }
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