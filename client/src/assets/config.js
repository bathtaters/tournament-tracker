// Config settings

export const suggestText = {
  hideListWhenEmpty: false, // when textbox empty: false = show all / true = show none
  hideStaticWhenEmpty: true, // when ^ is false, don't show 'static' options (ie. 'add player')
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