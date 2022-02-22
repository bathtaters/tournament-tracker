import React from "react";
import PropTypes from 'prop-types';

import RawDataStyle from "./styles/RawDataStyle";
import { useSettingsQuery } from "./common.fetch";

// Display raw data
function RawData({ data, className = "" }) {
  const { data: settings, isLoading, error } = useSettingsQuery();

  if (isLoading || error || !settings || !settings.showadvanced || !settings.showrawjson || !data)
    return null;

  const styleData = JSON.stringify(data).replace(/:/g,': ').replace(/,/g,', ');
  
  return (<RawDataStyle className={className}>{styleData}</RawDataStyle>);
}

RawData.propTypes = { data: PropTypes.any, className: PropTypes.string };

export default RawData;