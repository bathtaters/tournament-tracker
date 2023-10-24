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
  creditsPerRank: [
    // TODO: Move to Gonti settings
    250, // 1st
    200,
    150,
    130,
    120,
    100,
    100,
    50, // 8th
    50,
    50,
    50,
    50,
    50,
    50,
    50,
  ],
  didntPlayCredits: 50,
  
};