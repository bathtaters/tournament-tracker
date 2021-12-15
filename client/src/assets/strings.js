// --- Static Strings --- \\

export const defaultDraftTitle = "New Draft";




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


// --- Lists --- \\
export const statusInfo = [
  {label: 'N/A', class: "dim-color"},
  {label: 'Not Started', class: "pos-color"},
  {label: 'Active', class: "neg-color"},
  {label: 'Complete', class: "max-color"},
];
export const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const roundButtonText = [
  "Loading", "Start Draft", "Awaiting Report",
  "Next Round", "End Draft", "Draft Complete"
];

// --- Formatting --- \\

export const showRawJson = false;

export const formatQueryError = err => 'ERROR: '+JSON.stringify(err);

export const formatMatchTitle = (matchPlayers, playerData) =>
  Object.keys(matchPlayers).map(id => (playerData[id] && playerData[id].name) || '?').join(' vs. ');

export const formatRecord = (record, braces=true) => (braces?'[ ':'')+(record || ['','']).join(' - ')+(braces?' ]':'');

export const formatNum = num => num == null ? '-' : num;

export const formatPercent = decimal => decimal == null ? '- %' : (Math.round(decimal * 1000) / 10) + '%';