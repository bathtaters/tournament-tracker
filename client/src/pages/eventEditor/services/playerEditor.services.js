import { getRemaining, playerExists, randomArray } from "./playerEditor.utils";
import { createPlayerMsg, playerCreateError, duplicatePlayerMsg } from "../../../assets/strings";
import valid from "../../../assets/validation.json";
const autofillDef = valid.defaults.settings.autofillsize;


// Add new player to DB
async function newPlayerController(playerData, players, createPlayer, pushPlayer) {
  // Check for errors/confirm
  if (playerExists(playerData.name, players)) return window.alert(duplicatePlayerMsg(playerData.name));
  if (!window.confirm(createPlayerMsg(playerData.name))) return false;

  // Create & Push player
  const res = await createPlayer(playerData);
  if (res?.error || !res?.data?.id) throw playerCreateError(res, playerData);
  return pushPlayer(res.data.id) && res.data.id;
}


// Click add button
export const onSubmitController = (hideSuggest, setHide, handleNewPlayer, pushPlayer, onEdit) =>
  function submitHandler(entry, text) {
    // Show/Hide field
    if (hideSuggest) return setHide(false);
    if (!entry) return setHide(!hideSuggest);

    // Call onEdit
    if (onEdit && !entry.isStatic) onEdit();

    // Add Player
    if (entry.id) return pushPlayer(entry.id);
    if (!entry.isStatic) console.warn('Missing player created automatically', entry);
    return handleNewPlayer(text);
  }


// Build PlayerInput props
export default function playerInputController({
  data, playerList, setPlayerList, createPlayer, pushPlayer, onFirstEdit, autofillSize = autofillDef
}) {
  const remainingPlayers = getRemaining(data, playerList);

  return {
    // Simple props
    data, remainingPlayers, autofillSize, pushPlayer, onFirstEdit,
    hideAutofill: Boolean(playerList.length),

    // Handle adding a new player
    handleNewPlayer: (name) => newPlayerController({ name }, data, createPlayer, pushPlayer),

    // Handle autofill click
    autofill: () => {
      setPlayerList(randomArray(remainingPlayers, autofillSize));
      onFirstEdit();
    },
  };
}