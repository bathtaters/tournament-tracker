import React from "react";
import PropTypes from 'prop-types';

import { reloadClass } from "../styles/HeaderStyles";
import { useForceRefetch, useFetchingProvider } from "../../common/common.fetch";

function ReloadButton(props) {
  // Check for active queries
  const isFetching = useFetchingProvider(); // setup isFetching global

  // Force refetch of all data
  const forceRefetch = useForceRefetch();

  // Generate class
  const buttonClass = `${props.force ?? isFetching ? reloadClass.loading : reloadClass.button} ${props.className ?? ''}`

  return <h4 className={buttonClass} onClick={forceRefetch}>↻</h4>
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