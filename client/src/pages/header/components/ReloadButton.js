import React from "react";
import PropTypes from 'prop-types';

import ReloadIcon from "../../common/icons/ReloadIcon";
import { reloadingClass } from "../styles/HeaderStyles";
import { useForceRefetch, useFetchingProvider } from "../../common/common.fetch";

function ReloadButton(props) {
  // Check for active queries
  const _isFetching = useFetchingProvider(); // setup isFetching global
  const isFetching = props.force ?? _isFetching

  // Force refetch of all data
  const forceRefetch = useForceRefetch();

  // Generate class
  const buttonClass = `${isFetching ? reloadingClass : ''} ${props.className ?? ''}`

  return <button type="button" className={buttonClass} disabled={isFetching} onClick={forceRefetch}><ReloadIcon /></button>
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