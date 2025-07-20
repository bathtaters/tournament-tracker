import React from "react";
import PropTypes from "prop-types";

import CounterStyle from "./styles/CounterStyle";
import useCounterController from "./services/counter.services";

function Counter({
  val,
  setVal,
  maxVal,
  isEditing,
  suff = "",
  className = "",
}) {
  const [dispVal, incVal] = useCounterController(val, setVal, maxVal, suff);

  if (!isEditing) return <span className={className}>{dispVal}</span>;

  return (
    <CounterStyle className={className} onClick={incVal}>
      {dispVal}
    </CounterStyle>
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
