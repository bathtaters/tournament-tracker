import type { AlertOptions } from "types/base";
import {
  isRejectedWithValue,
  type Middleware,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { openAlert } from "../store/alertSlice";
import { errorMessage, errorTitle } from "../../assets/constants";
import { errorAlertBase } from "../../assets/alerts";
import { debugLogging } from "../../assets/config";

// Build alert
const capitalize = (str: string) =>
  str && `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

const getErrorAlert = (
  endpoint: string,
  msg: string,
  args?: any,
): AlertOptions => ({
  ...errorAlertBase,
  title:
    endpoint in errorTitle
      ? errorTitle[endpoint](args)
      : errorTitle.default(args),
  message:
    msg in errorMessage
      ? errorMessage[msg](args)
      : capitalize(msg) || errorMessage.default(args),
});

// Middleware to catch errors
const errorMiddleware: Middleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    // Detect rejected requests
    if (isRejectedWithValue(action)) {
      const rejectedAction = action as RejectedAction;

      // Get values from input
      const status = rejectedAction.payload.status;
      const statusMsg = typeof status === "string" ? status : null;

      debugLogging &&
        console.error(
          "Error handler:",
          rejectedAction.meta.arg,
          rejectedAction.payload,
        );

      // Open alert
      (dispatch as any)(
        /* 'any' required to avoid circular dependency */
        openAlert(
          getErrorAlert(
            rejectedAction.meta.arg.endpointName,
            statusMsg || rejectedAction.payload.data.error,
            statusMsg
              ? rejectedAction.payload.data
              : rejectedAction.meta.arg.originalArgs,
          ),
        ),
      );
    }

    return next(action);
  };

export default errorMiddleware;

// Middleware Types

interface ErrorPayload {
  status?: number | string;
  data: {
    error: string;
    [key: string]: any;
  };
}

interface RejectedActionMeta {
  arg: {
    endpointName: string;
    originalArgs: any;
    [key: string]: any;
  };
  [key: string]: any;
}

type RejectedAction = PayloadAction<ErrorPayload, string, RejectedActionMeta>;
