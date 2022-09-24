import { isRejectedWithValue } from '@reduxjs/toolkit'
import { openAlert } from '../store/alertSlice'

import { errorTitle, errorMessage } from '../../assets/constants'
import { errorAlertBase } from '../../assets/alerts'
import { debugLogging } from '../../assets/config'

// Build alert
const capitalize = (str) => str && str.slice(0,1).toUpperCase() + str.slice(1)

const getErrorAlert = (endpoint, msg, args) => ({
  ...errorAlertBase,
  title:   errorTitle[endpoint] ? errorTitle[endpoint](args) : errorTitle.default,
  message: errorMessage[msg] ? errorMessage[msg](args) : capitalize(msg) || errorMessage.default,
})

// Catch errors middleware
const errorMiddleware = ({ dispatch }) => (next) => (action) => {
  
  // Detect rejected requests
  if (isRejectedWithValue(action)) {
    // Get values from input
    // const endpoint = action.meta.arg.endpointName
    // const msg = action.payload.data.error
    // const args = action.meta.arg.originalArgs
    const status = action.payload.status
    const statusMsg = status && typeof status !== 'number' && status

    debugLogging && console.error('Error handler:', action.meta.arg, action.payload)

    // Open alert
    dispatch(openAlert(getErrorAlert(
      action.meta.arg.endpointName,
      statusMsg || action.payload.data.error,
      statusMsg ? action.payload.data : action.meta.arg.originalArgs
    )))
  }

  return next(action)
}

export default errorMiddleware