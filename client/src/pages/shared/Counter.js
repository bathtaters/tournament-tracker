import React from "react";
import PropTypes from 'prop-types';

function Counter({val, setVal, maxVal, isEditing, suff = '', className = ''}) {
  const incVal = () => setVal((val + 1) % (maxVal + 1));
  const dispVal = val + (typeof suff === 'function' ? suff(val) : suff || '');

  if (!isEditing)
    return <span className={className}>{dispVal}</span>

  return (
    <span className={'link select-none '+className} onClick={incVal} unselectable="on">
      {dispVal}
    </span>
  );
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