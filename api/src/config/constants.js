module.exports = {
  defaultError: { 
    status: 500,
    message: "Unknown server error"
  },
  missingError: {
    status: 404,
    message: "Invalid address and/or method."
  },
  testError: {
    status: 418,
    message: "API is not a Teapot."
  },
  clockStates: [
    "Ended",
    "Running",
    "Off",
    "Paused"
  ],
  points: {
    win: 3,
    draw: 1,
    floor: 0.33
  },
  recordFields: [
    "Wins",
    "Losses",
    "Draws"
  ],
  playerAccess: [ 'guest', 'player', 'admin', 'owner' ],
};