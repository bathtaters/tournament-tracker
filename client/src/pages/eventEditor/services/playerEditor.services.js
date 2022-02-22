import { getRemaining, randomArray, filterPlayer, emptyNewPlayer } from "./playerEditor.utils";

import { createPlayerMsg, playerCreateError } from "../../../assets/strings";

import valid from "../../../assets/validation.json";
const autofillSize = valid.defaults.settings.autofillsize;


// Click add button
const clickAddController = (currPlayer, setPlayer, createPlayer, pushPlayer, onEdit) =>
  function clickAdd(override) {
    if (!currPlayer.visible) return setPlayer({ ...currPlayer, visible: true });

    let playerData = override || {...currPlayer};
    playerData.name = playerData.name && playerData.name.trim();
    if (!playerData.name) return setPlayer(emptyNewPlayer);

    onEdit && onEdit();
    if (playerData.id) return pushPlayer(playerData.id);
    return newPlayerController(filterPlayer(playerData), createPlayer, pushPlayer);
  }

// Click autofill cuttom
const autofillController = (players, setPlayers, size, onEdit) => () => {
  setPlayers(randomArray(players, size));
  onEdit && onEdit();
}

// Add new player to DB
async function newPlayerController(playerData, createPlayer, addPlayer) {
  if (!window.confirm(createPlayerMsg(playerData.name))) return true;
  const id = await createPlayer(playerData).then(r => r.data.id);
  if (!id) throw playerCreateError(playerData);
  return addPlayer(id);
}

// Update from SuggestText
const newPlayerChange = (newPlayer, setNewPlayer) => (e) => e.target.value !== undefined ? 
  setNewPlayer({ ...newPlayer, name: e.target.value, id: e.target.id }):
  setNewPlayer({ ...newPlayer, id: e.target.id });


// ---------- Combine & adapt to PlayerInput ---------- \\

export default function playerEditorController({ data, playerList, newPlayer, setNewPlayer, setPlayerList, createPlayer, pushPlayer, onEdit }) {
  const remainingPlayers = getRemaining(data, playerList);

  return {
    // Args
    data, newPlayer, remainingPlayers, autofillSize,
    showAutofill: playerList.length || newPlayer.visible,

    // Handle SuggestText change
    handlePlayerChange: newPlayerChange(newPlayer, setNewPlayer),

    // Handle + button click
    handleAdd: clickAddController(newPlayer, setNewPlayer, createPlayer, pushPlayer, onEdit),

    // Handle autofill click
    autofill: autofillController(remainingPlayers, setPlayerList, autofillSize, onEdit),

    // Handle adding a new player
    handleNewPlayer: name => newPlayerController({ name }, createPlayer, pushPlayer),
  };
}