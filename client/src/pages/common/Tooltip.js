import React from "react";
import PropTypes from 'prop-types';
import { TooltipStyle, TooltipWrapperStyle } from "./styles/TooltipStyles";

function Tooltip({ className = "", tooltipClass = "", tooltip, children }) {
  return (
    <TooltipWrapperStyle className={className}>
      { Boolean(tooltip) && <TooltipStyle className={tooltipClass}>{tooltip}</TooltipStyle> }

      {children}
    </TooltipWrapperStyle>
  )
}

Tooltip.propTypes = {
    className: PropTypes.string,
    tooltipClass: PropTypes.string,
    tooltip: PropTypes.any,
    children: PropTypes.any,
}

export default Tooltip