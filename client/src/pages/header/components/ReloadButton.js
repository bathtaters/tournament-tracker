import React from "react";
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from "react-redux";

import LoadingStyle from "../styles/LoadingStyle"
import { forceRefetchConstructor, isAnyLoading } from "../services/headerFetch.services";

function ReloadButton(props) {
  // Force refetch of all data
  const dispatch = useDispatch();  
  const forceRefetch = forceRefetchConstructor(dispatch);

  // Check for active queries
  const isLoading = useSelector(isAnyLoading);

  return ('force' in props ? props.force : isLoading) ? 
    
    // Loading ring
    <LoadingStyle {...props} />:

    // Reload button
    <h4 className={'link '+props.className} onClick={forceRefetch}>↻</h4>;
}

ReloadButton.propTypes = { 
  force: PropTypes.bool,
  size: PropTypes.number,
  weight: PropTypes.number,
  hideBgd: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string,
};

export default ReloadButton;