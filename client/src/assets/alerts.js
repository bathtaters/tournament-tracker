// Alerts
const defPlayer = 'This player';

export const modalCloseAlert = (customMsg) => ({
  message: customMsg || "Are you sure you want to close? Unsaved changes will be lost.",
  buttons: ["Yes", "No"], // [0]=Y
})

export const deleteEventAlert = (title) => ({
  message: "Are you sure you want to delete " + (title || 'this event') + "? It will be lost for good.",
  buttons: [{ value: "Delete Event", className: "neg-bgd base-color-inv" }, "Cancel"], // [0]=Y
})

export const duplicatePlayerAlert = (name) => ({ message: (name || defPlayer) + " is already in this event." })

export const createPlayerAlert = (name) => ({
  message: (name || defPlayer) + " does not exist. Would you like to create a profile?",
  buttons: ["Create", "Cancel"], // [0]=Y
})

export const unsavedPlayerAlert = (name) => ({
  message: (name || defPlayer) + " has not been added to the event. Would you like to add now?",
  buttons: ["Add & Save", "Drop & Save", "Cancel"], // [0]=Y+, [1]=Y-, [2]=N
})

export const clearReportAlert = (title) => ({
  message: `Are you sure you want to delete the records for ${title}?`,
  buttons: ["Delete", "Cancel"], // [0]=Y
})

export const deletePlayerAlert = (name) => ({
  message: "Are you sure you want to delete "+(name || defPlayer.toLowerCase())+"? All of their info will be lost.",
  buttons: ["Delete", "Cancel"], // [0]=Y
})

export const duplicateNameAlert = (name) => ({ message: (name || defPlayer) + " already exists." })

export const cantDeletePlayerAlert = (name) => ({ message: name+" cannot be deleted while registered for events." });

export const emptyNameAlert = { message: "Please enter a name." }

export const notLoadedAlert = { message: "Page data not loaded. Try again in a minute or refresh." }

export const deleteRoundAlert = {
  message: "Are you sure you want to delete this round? Reported matches will be lost for good.",
  buttons: ["Yes", "No"], // [0]=Y
}

export const swapPlayerAlert = {
  message: "Are you sure you want to swap "+"these players"+"? The match(es) have already been reported.",
  // "these players" = (nameA ? nameA + ' w/ ' + nameB : 'these players')
  buttons: ["Swap","Cancel"], // [0]=Y
}

export const resetDbAlert = {
  title: "Erase ALL DATA?", message: "ALL players & games will be lost with no hope of recovery!",
  buttons: [{ value: "Erase Database", className: "neg-bgd base-color-inv" }, "Cancel"], // [0]=Y
  className: "base-bgd max-color",
}

export const resetDbAlertConfirm = {
  title: "Confirm Total Erase", message: "Are you sure you want to go through with this?",
  buttons: ["Cancel", { value: "Erase Database", className: "neg-bgd base-color-inv" }], // [1]=Y
  className: "base-bgd max-color",
}

// --- Errors --- \\

export const playerCreateError = ({ error }, { name }) => new Error(error?.data?.error ? error.data.error : '"'+name+'" was not able to be added.')