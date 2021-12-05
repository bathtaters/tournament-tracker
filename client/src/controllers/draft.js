
// Draft status
// [0: N/A, 1: Pre-Draft, 2: Active, 3: Complete]

export const draftStatus = (activeRound, totalRounds) => 
  !totalRounds ? 0 : !activeRound ? 1 :
  activeRound < totalRounds ? 2 : 3;


// Round status

export const roundIsDone = matches => 
  !matches.length || (
    matches[matches.length - 1]
    && matches[matches.length - 1].every(m => m.reported)
  );


// Dropped players

export const getMatchDrops = (matchData, remainingPlayers) =>
  Object.keys(matchData.players).filter(p => !remainingPlayers.includes(p));

export const getRoundDrops = (roundMatches, remainingPlayers) => roundMatches.reduce(
  (d,m) => d.concat(getMatchDrops(m, remainingPlayers)),
[]);


// Player records

export const recordToPoints = record => record[0] * 3 + (record[2] || 0) * 1;

export const sortByRecord = players => Object.keys(players).sort((a,b) => 
  recordToPoints(b) - recordToPoints(a)
);