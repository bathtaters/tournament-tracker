import React from "react";
import PropTypes from 'prop-types';

import { ElementInput, ElementLabel } from "./OtherElements";
import { ElementStyle } from "../../styles/InputFormStyles";

import getProps from "../../services/InputForm/inputElement.controller";
import getClasses from "../../services/InputForm/inputClass.controller";


function InputElement(props) {

  // Get element styles (or defaults if none provided)
  const { className, labelClass, inputClass, inputWrapperClass, labelType } = getClasses(props);

  // Get element props
  const inputProps = getProps(props);

  // Render
  return (
    <ElementStyle isFragment={props.isFragment} isLabel={labelType.nest} className={className}>
      {labelType.first && <ElementLabel id={inputProps.id} label={props.label} isLabel={!labelType.nest} className={labelClass} />}

      <ElementInput inputProps={inputProps} backend={props.backend} className={inputClass} wrapperClass={inputWrapperClass} />

      {!labelType.first && <ElementLabel id={inputProps.id} label={props.label} isLabel={!labelType.nest} className={labelClass} />}
    </ElementStyle>
  );
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