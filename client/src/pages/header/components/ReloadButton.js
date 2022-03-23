import React from "react";
import PropTypes from 'prop-types';

import LoadingStyle from "../styles/LoadingStyle"
import { useGlobalFetching, useForceRefetch } from "../header.fetch";

function ReloadButton(props) {
  // Check for active queries
  const isFetching = useGlobalFetching();

  // Force refetch of all data
  const forceRefetch = useForceRefetch();

  return ('force' in props ? props.force : isFetching) ? 
    
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