// --- Static Strings --- \\

export const defaultDraftTitle = "New Draft";




// --- Dynamic Strings --- \\


// Messages
export const createPlayerMsg = name => name + " does not exist. Would you like to create a profile?";
export const duplicatePlayerMsg = name => name + " is already in this draft.";
export const unsavedPlayerMsg = name => name + " has not been added to the draft. Would you like to add now?";
export const deletePlayerMsg = name => "Are you sure you want to delete "+name+"? All of their info will be lost.";


// --- Lists --- \\

export const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];


// --- Formatting --- \\

export const formatMatchTitle = (matchPlayers, playerData) =>
  Object.keys(matchPlayers).map(id => playerData[id].name).join(' vs. ');

export const formatRecord = (record, braces=true) => (braces?'[ ':'')+record.join(' - ')+(braces?' ]':'');
