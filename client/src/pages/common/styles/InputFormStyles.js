import React from "react";
import PropTypes from 'prop-types';

// Input Element
export const elementDefaults = {
  className:  "text-sm sm:text-lg font-light m-1 flex items-baseline",
  labelClass: "mx-2 w-max whitespace-nowrap",
  inputClass: "max-color pt-1 px-2",
  buttonClass: "font-light base-color w-14 h-8 mx-1 sm:w-20 sm:h-11 sm:mx-4",
}

// Row/Column wrapper
export function RowStyle({ isRow, children }) {
  return (
    <div className={"m-2 flex justify-start items-baseline flex-"+(isRow ? "row flex-wrap-reverse" : "col")}>
      {children}
    </div>
  );
}

// Input Element wrapper
export function ElementStyle({ isFragment, className, children }) {
  if (isFragment) return (<>{children}</>);
  return (<div className={className}>{children}</div>);
}

// Input Form Buttons
export function ButtonContainer({ children }) {
  return (<div className="mt-4 w-full flex justify-center items-baseline flex-wrap">{children}</div>);
}

export function ButtonElement({ label, onClick, className = elementDefaults.buttonClass, isSubmit = false }) {
  return (
    <input
      className={className}
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