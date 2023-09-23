// --- Constants --- \\
const defPlayer = 'This player';


// --- Generic Alerts --- \\

export const modalCloseAlert = (customAlert = {}) => ({
  title: "Close Window?",
  message: "Unsaved changes will be lost.",
  buttons: ["Close", { value: "Back", className: "btn-info" }], // [0]=Y
  ...customAlert
})

export const notLoadedAlert = { title: "Still Loading", message: "Try again in a minute or refresh." }

export const errorAlertBase = { buttons: [{ value: "Ok", className: "btn-warning" }], className: "", showClose: true }


// --- EventEditor Alerts --- \\

export const deleteEventAlert = (title) => ({
  message: "Are you sure you want to delete " + (title || 'this event') + "? It will be lost for good.",
  buttons: [{ value: "Delete Event", className: "btn-error" }, "Cancel"], // [0]=Y
})

export const duplicateItemAlert = (type, name) => ({
  title: `Can't Add ${type}`,
  message: `${name || defPlayer} was already added.`,
})

export const createItemAlert = (type, name) => ({
  title: `New ${type}?`,
  message: `Would you like to create a new ${type.toLowerCase()}${name ? ` called ${name}` : '' }?`,
  buttons: [{ value: "Create",  className: "btn-success" }, "Cancel"], // [0]=Y
})

export const unsavedPlayerAlert = (name) => ({
  title: "Add Player?",
  message: `Would you like to add ${name || defPlayer} before saving?`,
  buttons: [ // [0]=Y+, [1]=Y-, [2]=N
    { value: "Add",  className: "btn-success" },
    { value: "Drop", className: "btn-error" },
    "Back"
  ],
})


// --- Event Alerts --- \\

export const clearReportAlert = (title) => ({
  title: "Confirm Clear",
  message: `This will delete match records for\n${title}.`,
  buttons: [{ value: "Clear", className: "btn-error" }, "Cancel"], // [0]=Y
})

export const deleteRoundAlert = {
  title: "Confirm Delete",
  message: "Deleting this round will erase these matches for good.",
  buttons: [{ value: "Delete", className: "btn-error" }, "Cancel"], // [0]=Y
}

export const swapPlayerAlert = {
  title: "Confirm Swap",
  message: "One or both matches have already been reported.",
  // "these players" = (nameA ? nameA + ' w/ ' + nameB : 'these players')
  buttons: [{ value: "Swap", className: "btn-error" }, "Cancel"], // [0]=Y
}

export const savePlanAlert = {
  title: "Replace Schedule",
  message: "Scheduling these events will unschedule all currently scheduled events.",
  buttons: [{ value: "Replace", className: "btn-error" }, "Cancel"], // [0]=Y
}

export const resetPlanAlert = {
  title: "Reset Plan",
  message: "This will erase all vote data and plan settings.",
  buttons: [{ value: "Erase", className: "btn-error" }, "Cancel"], // [0]=Y
}


// --- Player Alerts --- \\

export const deletePlayerAlert = (name) => ({
  title: "Confirm Delete",
  message: `All of ${name || defPlayer.toLowerCase()}'s info will be lost.`,
  buttons: [{ value: "Delete", className: "btn-error" }, "Cancel"], // [0]=Y
})

export const cantDeletePlayerAlert = (name) => ({ title: "Can't Delete", message: name+" is registered for events." });

export const duplicateNameAlert = (name) => ({ title: "Invalid Player", message: (name || defPlayer) + " is already there." })

export const emptyNameAlert = { title: "Invalid Player", message: "They need a name." }


// --- Settings Alerts --- \\

export const resetDbAlert = {
  title: "Confirm Erase", message: "ALL players & games will be lost with no hope of recovery!",
  buttons: [{ value: "Erase Database", className: "btn-error" }, "Cancel"], // [0]=Y
  className: "bg-error text-error-content",
}

export const resetDbAlertConfirm = {
  title: "Erase ALL DATA", message: "Are you sure you want to go through with this?",
  buttons: ["Cancel", { value: "Erase Database", className: "btn-error" }], // [1]=Y
  className: "bg-error text-error-content",
}


// --- Errors --- \\

export const itemCreateError = (type, { error }, { name }) => new Error(error?.data?.error ? error.data.error : `${type} "${name}" was not able to be added.`)