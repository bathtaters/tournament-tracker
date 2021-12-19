import React from "react";
import PropTypes from 'prop-types';

import { useSelector, useDispatch } from "react-redux";
import { baseApi, tagTypes } from "../../models/baseApi";

function ReloadButton({ size = 8, weight = 4, force = null, hideBgd = false, color = '#3498db', className }) {
  const dispatch = useDispatch();
  const isLoading = useSelector(state => Object.values(state.dbApi.queries).some(qry => qry.status === 'pending'));
  const display = force != null ? force : isLoading;
  const sizeClass = `border-${hideBgd ? 0 : weight} border-t-${weight} ` +
    `h-${size} w-${size} sm:h-${size+2} sm:w-${size+2}`;
    // sm:border-${weight} sm:border-t-${weight}
  
  const forceRefetch = () => dispatch(baseApi.util.invalidateTags(tagTypes));

  return pug`
    if display
      .loader.ease-linear.rounded-full.dim-border(
        className=sizeClass+" "+className
        style=({borderTopColor: color})
      )

    else
      h4.link(onClick=forceRefetch className=className) ↻
  `;
}

ReloadButton.propTypes = { 
  className: PropTypes.string,
  color: PropTypes.string,
  force: PropTypes.bool,
  size: PropTypes.number,
  weight: PropTypes.number,
  hideBgd: PropTypes.number,
};

export default ReloadButton;