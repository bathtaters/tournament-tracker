import { swapPlayerAlert } from "../../../assets/alerts";
import { dragType } from "../../../assets/constants";
export const dataType = dragType.player;

// Helpers for swapping player arrays during optimistic updates

export const swapPlayerArrays = (
  baseArr,
  swapArr,
  swapIndxes,
  baseKey = "players",
  swapIdKey = "id"
) => {
  [
    baseArr[swapArr[0][swapIdKey]][baseKey][swapIndxes[0]],
    baseArr[swapArr[1][swapIdKey]][baseKey][swapIndxes[1]],
  ] = [
    baseArr[swapArr[1][swapIdKey]][baseKey][swapIndxes[1]],
    baseArr[swapArr[0][swapIdKey]][baseKey][swapIndxes[0]],
  ];
};

export const moveDrops = (baseArr, fromId, toId, moveValue) => {
  const idx = baseArr[fromId].drops.indexOf(moveValue);
  if (idx !== -1) {
    const playerId = baseArr[fromId].drops.splice(idx, 1)[0];
    if (baseArr[toId].reported) baseArr[toId].drops.push(playerId);
  }
};

// Construct swap handler
export const swapController =
  (swapPlayers, eventid, openAlert) => async (playerA, playerB) => {
    if (playerA.playerid === playerB.playerid) return;
    const doSwap =
      (!playerA.reported && !playerB.reported) ||
      (await openAlert(swapPlayerAlert, 0));
    if (doSwap) swapPlayers({ eventid, swap: [playerA, playerB] });
  };

// Test if swap is allowed
export const canSwap = (type, a, b) =>
  type === dataType && a.playerid !== b.playerid;
