import React from "react";
import PropTypes from 'prop-types';

function Counter({val, setVal, maxVal, isEditing, suff = '', className = ''}) {
  const incVal = () => setVal((val + 1) % (maxVal + 1));

  return pug`
    if isEditing
      span.link.select-none(
        onClick=incVal,
        className=className,
        unselectable="on"
      )= val + (typeof suff === 'function' ? suff(val) : suff || '')
    
    else
      span(className=className)= val + (typeof suff === 'function' ? suff(val) : suff || '')
  `;
}

Counter.propTypes = {
  val: PropTypes.number.isRequired,
  setVal: PropTypes.func.isRequired,
  maxVal: PropTypes.number.isRequired,
  isEditing: PropTypes.bool.isRequired,
  suff: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  className: PropTypes.string,
};

export default Counter;