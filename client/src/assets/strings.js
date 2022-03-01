// --- Static Strings --- \\

export const defaultTournamentTitle = "My Tournament";
export const defaultEventTitle = "New Event";
export const defaultPlayerName = "New Player";
export const maxDrawsCounter = 1;
export const dragType = { event: "json/eventday", player: "json/matchplayer" };



// --- Dynamic Strings --- \\


// Messages
const defPlayer = 'This player';
export const createPlayerMsg = name => (name || defPlayer) + " does not exist. Would you like to create a profile?";
export const duplicatePlayerMsg = name => (name || defPlayer) + " is already in this event.";
export const unsavedPlayerMsg = name => (name || defPlayer) + " has not been added to the event. Would you like to add now?";
export const unaddedPlayerMsg = name => (name || defPlayer) + " has not been added to the event. Would you like to continue without this player?";
export const deletePlayerMsg = name => "Are you sure you want to delete "+(name || defPlayer.toLowerCase())+"? All of their info will be lost.";
export const deleteEventMsg = name => "Are you sure you want to delete "+(name || 'this event')+"? It will be lost for good.";
export const swapPlayerMsg = (nameA,nameB) => "Are you sure you want to swap "+(nameA ? nameA + ' w/ ' + nameB : 'these players')+"? Their match(es) have already been reported.";
export const deleteRoundMsg = "Are you sure you want to delete this round? Reported matches will be lost for good.";
export const cantDeletePlayerMsg = name => name+" cannot be deleted while registered for events.";
export const clearReportMsg = (title) => `Are you sure you want to delete the records for ${title}?`;

// Errors
export const playerCreateError = ({ name }) => (new Error('"'+name+'" was not able to be added.'))


// --- Lists --- \\
export const statusInfo = [
  {label: 'N/A', class: "dim-color"},
  {label: 'Not Started', class: "max-color"},
  {label: 'Active', class: "neg-color"},
  {label: 'Complete', class: "pos-color"},
  {label: 'N/A', class: "dim-color"},
];
export const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const roundButtonText = [
  "Loading", "Start Event", "Awaiting Report",
  "Next Round", "End Event", "Event Complete"
];

// --- Formatting --- \\

export const formatQueryError = err => 'ERROR: '+JSON.stringify(err);

export const formatMatchTitle = (matchPlayers, playerData) =>
  matchPlayers.map(id => (playerData[id] && playerData[id].name) || '?').join(' vs. ');

export const formatRecord = (record, braces=true) => (braces?'[ ':'')+(record || ['','']).join(' - ')+(braces?' ]':'');

export const formatNum = num => num == null ? '-' : num;

export const formatPercent = decimal => decimal == null ? '- %' : (Math.round(decimal * 1000) / 10) + '%';