import type { AlertOptions } from "types/base";

// --- Constants --- \\

const defPlayer = "This player";

// --- Generic Alerts --- \\

export const modalCloseAlert = (
  customAlert: AlertOptions = {},
): AlertOptions => ({
  title: "Close Window?",
  message: "Unsaved changes will be lost.",
  buttons: ["Close", { value: "Back", className: "btn-info" }], // [0]=Y
  ...customAlert,
});

export const notLoadedAlert: AlertOptions = {
  title: "Still Loading",
  message: "Try again in a minute or refresh.",
};

export const errorAlertBase: AlertOptions = {
  buttons: [{ value: "Ok", className: "btn-warning" }],
  className: "",
  showClose: true,
};

// --- EventEditor Alerts --- \\

export const deleteEventAlert = (title?: string): AlertOptions => ({
  message:
    "Are you sure you want to delete " +
    (title || "this event") +
    "? It will be lost for good.",
  buttons: [{ value: "Delete Event", className: "btn-error" }, "Cancel"], // [0]=Y
});

export const duplicateItemAlert = (
  type: string,
  name?: string,
): AlertOptions => ({
  title: `Can't Add ${type}`,
  message: `${name || defPlayer} was already added.`,
});

export const createItemAlert = (type: string, name?: string): AlertOptions => ({
  title: `New ${type}?`,
  message: `Would you like to create a new ${type.toLowerCase()}${name ? ` called ${name}` : ""}?`,
  buttons: [{ value: "Create", className: "btn-success" }, "Cancel"], // [0]=Y
});

// --- Event Alerts --- \\

export const clearReportAlert = (title: string): AlertOptions => ({
  title: "Confirm Clear",
  message: `This will delete match records for\n${title}.`,
  buttons: [{ value: "Clear", className: "btn-error" }, "Cancel"], // [0]=Y
});

export const deleteRoundAlert: AlertOptions = {
  title: "Confirm Delete",
  message: "Deleting this round will erase these matches for good.",
  buttons: [{ value: "Delete", className: "btn-error" }, "Cancel"], // [0]=Y
};

export const swapPlayerAlert: AlertOptions = {
  title: "Confirm Swap",
  message: "One or both matches have already been reported.",
  // "these players" = (nameA ? nameA + ' w/ ' + nameB : 'these players')
  buttons: [{ value: "Swap", className: "btn-error" }, "Cancel"], // [0]=Y
};

export const savePlanAlert: AlertOptions = {
  title: "Replace Schedule",
  message:
    "Scheduling these events will unschedule all currently scheduled events.",
  buttons: [{ value: "Replace", className: "btn-error" }, "Cancel"], // [0]=Y
};

export const resetPlanAlert: AlertOptions = {
  title: "Reset Plan",
  message: "This will erase all vote data and plan settings.",
  buttons: [{ value: "Erase", className: "btn-error" }, "Cancel"], // [0]=Y
};

// --- Player Alerts --- \\

export const deletePlayerAlert = (name?: string): AlertOptions => ({
  title: "Confirm Delete",
  message: `All of ${name || defPlayer.toLowerCase()}'s info will be lost.`,
  buttons: [{ value: "Delete", className: "btn-error" }, "Cancel"], // [0]=Y
});

export const cantDeletePlayerAlert = (name?: string): AlertOptions => ({
  title: "Can't Delete",
  message: name + " is registered for events.",
});

export const duplicateNameAlert = (name?: string): AlertOptions => ({
  title: "Invalid Player",
  message: (name || defPlayer) + " is already there.",
});

export const emptyNameAlert: AlertOptions = {
  title: "Invalid Player",
  message: "They need a name.",
};

// --- Settings Alerts --- \\

export const resetDbAlert: AlertOptions = {
  title: "Confirm Erase",
  message: "ALL players & games will be lost with no hope of recovery!",
  buttons: [{ value: "Erase Database", className: "btn-error" }, "Cancel"], // [0]=Y
  className: "bg-error text-error-content",
};

export const resetDbAlertConfirm: AlertOptions = {
  title: "Erase ALL DATA",
  message: "Are you sure you want to go through with this?",
  buttons: ["Cancel", { value: "Erase Database", className: "btn-error" }], // [1]=Y
  className: "bg-error text-error-content",
};

// --- Setup/Reset Password Messages --- \\

export const hasherAlert: AlertOptions = {
  title: "Browser Error",
  message:
    "Password encryption failed! You may need to upgrade your browser to use this website.",
};

export const setupMessage = ({
  valid,
  isSet,
  isCreate,
}: {
  valid?: boolean;
  isSet?: boolean;
  isCreate?: boolean;
}) => {
  if (isCreate) {
    return isSet && valid
      ? {
          title: "Account Successfully Created",
          body: "You can use it to sign in at the top right.",
          link: "Go to home page",
          to: "/home",
        }
      : {
          title: "Account Creation Failure",
          body: "If this continues to happen, try resetting the database.",
          link: "Go to setup page",
          to: "/setup",
        };
  }
  return isSet && valid
    ? {
        title: "Password Successfully Reset",
        body: "You can use it to sign in at the top right.",
        link: "Go to home page",
        to: "/home",
      }
    : {
        title: "Password Link Expired",
        body: "You'll need to request a new one.",
        link: "Go to home page",
        to: "/home",
      };
};

// --- Errors --- \\

export const itemCreateError = (
  type: string,
  { error }: { error?: any } = {},
  { name }: { name?: string } = {},
) =>
  new Error(
    error?.data?.error
      ? error.data.error
      : `${type} "${name}" was not able to be added.`,
  );
