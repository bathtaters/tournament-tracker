import React from "react";
import { formatQueryError } from "../../assets/strings";

function Loading({ loading = false, error = null, altMsg = 'Missing data', className = '', TagName = 'div' }) {
  return (<TagName className={"italic text-center font-thin "+className}>{
      loading ? 'Loading...' :
      !error ? altMsg :
      formatQueryError(error)
    }</TagName>);
}

export default Loading;