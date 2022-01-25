// --- Static Strings --- \\

export const defaultTournamentTitle = "My Tournament";
export const defaultDraftTitle = "New Draft";
export const defaultPlayerName = "New Player";
export const maxDrawsCounter = 1;



// --- Dynamic Strings --- \\


// Messages
const defPlayer = 'This player';
export const createPlayerMsg = name => (name || defPlayer) + " does not exist. Would you like to create a profile?";
export const duplicatePlayerMsg = name => (name || defPlayer) + " is already in this draft.";
export const unsavedPlayerMsg = name => (name || defPlayer) + " has not been added to the draft. Would you like to add now?";
export const unaddedPlayerMsg = name => (name || defPlayer) + " has not been added to the draft. Would you like to continue without this player?";
export const deletePlayerMsg = name => "Are you sure you want to delete "+(name || defPlayer.toLowerCase())+"? All of their info will be lost.";
export const deleteDraftMsg = name => "Are you sure you want to delete "+(name || 'this draft')+"? It will be lost for good.";
export const swapPlayerMsg = (nameA,nameB) => "Are you sure you want to swap "+(nameA ? nameA + ' w/ ' + nameB : 'these players')+"? Their match(es) have already been reported.";
export const deleteRoundMsg = "Are you sure you want to delete this round? Reported matches will be lost for good.";
export const cantDeletePlayerMsg = name => name+" cannot be deleted while registered for events.";


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
  "Loading", "Start Draft", "Awaiting Report",
  "Next Round", "End Draft", "Draft Complete"
];

// --- Formatting --- \\

export const formatQueryError = err => 'ERROR: '+JSON.stringify(err);

export const formatMatchTitle = (matchPlayers, playerData) =>
  matchPlayers.map(id => (playerData[id] && playerData[id].name) || '?').join(' vs. ');

export const formatRecord = (record, braces=true) => (braces?'[ ':'')+(record || ['','']).join(' - ')+(braces?' ]':'');

export const formatNum = num => num == null ? '-' : num;

export const formatPercent = decimal => decimal == null ? '- %' : (Math.round(decimal * 1000) / 10) + '%';