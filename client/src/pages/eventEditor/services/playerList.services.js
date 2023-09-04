import { duplicatePlayerAlert } from "../../../assets/alerts";

// Add player to list
const pushPlayerController = (playerData, players, setPlayers, openAlert) => async function pushPlayer(playerId) {
  if (!playerId) throw new Error("Add player is missing playerid!");
  if (!players) players = []

  let res = true;
  if (players.includes(playerId)) {
    await openAlert(duplicatePlayerAlert(playerData[playerId]?.name));
    res = false;
  } else setPlayers(players.concat(playerId));

  return res;
};

// Remove player from list
const popPlayerController = (players, setPlayers) => (pid, idx) => function popPlayer() {
  const newList = players?.slice() || [];
  const rmvIdx = newList[idx] === pid ? idx : newList.lastIndexOf(pid);
  if (rmvIdx in newList) newList.splice(rmvIdx,1);
  setPlayers(newList);
};

// Combined
export default function playerListController (playerData, players, setPlayers, openAlert) {
  return {
    pushPlayer: pushPlayerController(playerData, players, setPlayers, openAlert),
    popPlayer: popPlayerController(players, setPlayers),
  };
}
