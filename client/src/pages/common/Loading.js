import React from "react"

import { LoadingStyle, LoadingWrapper } from "./styles/LoadingStyle"
import { formatQueryError } from "../../assets/formatting"

function Loading({ loading = false, error = null, altMsg = 'Missing data', className = '', tagName = 'div' }) {
  return (
    <LoadingStyle TagName={tagName} className={className}>
      {loading ? <LoadingWrapper /> : !error ? <LoadingWrapper>{altMsg}</LoadingWrapper> : formatQueryError(error)}
    </LoadingStyle>
  )
}

export default Loading