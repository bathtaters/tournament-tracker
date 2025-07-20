import PropTypes from 'prop-types';
import { ElementInput } from "./OtherElements";
import { ElementStyle, LockStyle } from "../../styles/InputFormStyles";
import getInputProps from "../../services/InputForm/inputElement.controller";

function InputElement({ label, isFragment, className, labelClass, inputClass, inputWrapperClass, ...props }) {

  // Get element props
  const inputProps = getInputProps(props, label)

  return (
    <ElementStyle
      className={className} isFragment={isFragment} inputProps={inputProps}
      label={label} labelClass={labelClass}
    >
      <ElementInput className={inputClass} wrapperClass={inputWrapperClass} inputProps={inputProps} />
      { inputProps.disabled && <LockStyle /> }
    </ElementStyle>
  )
}

// Validation
InputElement.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.string.isRequired,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  className: PropTypes.string,
  labelClass: PropTypes.string,
  inputClass: PropTypes.string,
  isFragment: PropTypes.bool,
  disabled: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  min: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
  limits: PropTypes.object,
  onChange: PropTypes.func,
  transform: PropTypes.func,
  stored: PropTypes.arrayOf(PropTypes.object),
  register: PropTypes.func,
}

export default InputElement