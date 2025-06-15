import PropTypes from 'prop-types'
import LockIcon from "../icons/LockIcon"
import WarningIcon from "../icons/WarningIcon"

// Input Element
export const elementDefaults = {
  className:  "font-light mx-1 sm:mx-4",
  labelClass: "",
  inputWrapperClass: "",
  inputClass: "",
  buttonClass: "btn-primary mx-1 sm:mx-4",
}
export const typeDefaults = {
  text: 'input invalid:input-warning',
  url: 'input invalid:input-warning',
  date: 'input invalid:input-warning',
  checkbox: 'toggle',
  time: 'input min-w-12 pl-2 py-1 invalid:input-warning',
  number: 'input invalid:input-warning p-1 text-center hide-arrows ',
  numberSize: 'w-12 sm:w-16 h-8 sm:h-12'
}

// Form wrapper
export function FormContainer({ onSubmit, children }) {
  return (<form onSubmit={onSubmit}>{children}</form>)
}

// Error Banner
export function FormErrorStyle({ children }) {
  return (
    <div className="alert alert-warning shadow-lg">
      <WarningIcon className="stroke-current shrink-0 h-6 w-6" />
      <span>{children}</span>
    </div>
  )
}

// Row/Column wrapper
export function RowStyle({ isRow, children }) {
  return (
    <div className={`flex justify-start ${isRow ? "flex-col sm:flex-row" : "flex-col"} w-full py-1`}>
      {children}
    </div>
  );
}

// Input Element wrapper
export function ElementStyle({ label, isFragment, inputProps, className, labelClass, children }) {
  if (isFragment) return (<>{children}</>);
  return (
    <span className={`${className ?? elementDefaults.className} w-full flex flex-row p-2`}>{
      inputProps.type === 'checkbox' ?
        <label className={`flex gap-2 text-sm text-left w-full ${inputProps.disabled ? 'join' : ''}`} htmlFor={inputProps.id}>
          {children}
          <span className={labelClass ?? elementDefaults.labelClass}>{label}</span>
        </label>
        :
        <label className={`floating-label w-full ${inputProps.disabled ? 'join' : ''}`} htmlFor={inputProps.id}>
          <span className={labelClass ?? elementDefaults.labelClass}>{label}</span>
          {children}
        </label>
    }</span>
  );
}

// Apply Disabled Lock to Input Elements
export function InputStyle({ disabled, className, children }) {
  return (
    <label className={(disabled ? "join " : "") + className}>
      { children }
      { disabled && <div className="bg-base-200 flex text-secondary pr-1 sm:pr-2 join-item"><LockIcon /></div> }
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