import React from "react";
import PropTypes from 'prop-types';
import { useSettingsQuery } from "../../../queries/baseApi";

const defaultRawClass = "text-center font-thin m-2 dim-color ";

// Display raw data
function RawData({ data, className = "" }) {
  const { data: settings, isLoading, error } = useSettingsQuery();
  if (isLoading || error || !settings || !settings.showadvanced || !settings.showrawjson)
    return null;
  
  return <div className={defaultRawClass + className}>{JSON.stringify(data)}</div>
}

RawData.propTypes = { data: PropTypes.any, className: PropTypes.string };

export default RawData;