// Dealing with Player records

export const recordToPoints = record => record[0] * 3 + (record[2] || 0) * 1;

export const sortByRecord = players => Object.keys(players).sort((a,b) => recordToPoints(b) - recordToPoints(a));