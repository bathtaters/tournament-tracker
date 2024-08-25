// Config settings

export const debugLogging = false

export const apiPollMs = 30000 // How often to poll API for updates

export const suggestText = {
  hideListWhenExact: false, // when exact match is entered, hide list
  hideListWhenEmpty: false, // when textbox empty: false = show all / true = show none
}

export const counter = {
  updateDelay: 500, // ms delay before updates are pushed to server
}

export const eventEditor = {
  checkTeamsForDupe: true, // check team names for duplicate player names
}

export const alert = {
  defaultResult: 'Close', // Result given when window is closed w/o setting result
}

export const settings = {
  // Store these settings locally (per user settings)
  storeLocal: ['showrawjson'],
  localPrefix: 'tt', // Use before localStorage keys to avoid potential collisions
}

export const plan = {
  updateDelay: 1000, // ms delay for throttling updates
  statusPoll: 5 * 1000,  // ms interval to poll for status at
}