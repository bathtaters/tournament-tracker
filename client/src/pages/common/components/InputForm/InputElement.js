import React from "react";
import PropTypes from 'prop-types';

import { ElementInput, ElementLabel } from "./OtherElements";
import { ElementStyle } from "../../styles/InputFormStyles";
import getProps, { getClasses } from "../../services/InputForm/inputElement.services";


function InputElement(props) {

  // Get element props
  const inputProps = getProps(props);

  // Get element styles (or defaults if none provided)
  const { className, labelClass, inputClass } = getClasses(props);

  const rightLabel = props.labelIsRight ?? props.type === 'checkbox';

  // Render
  return (
    <ElementStyle isFragment={props.isFragment} className={className}>
      {!rightLabel && <ElementLabel id={inputProps.id} label={props.label} className={labelClass} />}

      <ElementInput inputProps={inputProps} type={props.type} className={inputClass} />

      {rightLabel && <ElementLabel id={inputProps.id} label={props.label} className={labelClass} />}
    </ElementStyle>
  );
}

// Validation
InputElement.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.string.isRequired,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  labelClass: PropTypes.string,
  inputClass: PropTypes.string,
  labelIsRight: PropTypes.bool,
  isFragment: PropTypes.bool,
  disabled: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  min: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
  limits: PropTypes.object,
  onChange: PropTypes.func,
  transform: PropTypes.func,
  stored: PropTypes.arrayOf(PropTypes.object),
  register: PropTypes.func,
};

export default InputElement;