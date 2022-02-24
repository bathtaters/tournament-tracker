import React, { forwardRef } from "react";

function SuggestTextBox({ value, className, isHidden, setListVisible, change }, ref) {
  return (
    <input
      type="text"
      value={value}
      className={className + (isHidden ? ' hidden' : '')}
      onBlur={() => setListVisible(false)}
      onFocus={() => setListVisible(true)}
      onChange={change}
      ref={ref}
    />
  );
}

export default forwardRef(SuggestTextBox);