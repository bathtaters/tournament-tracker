import { swapPlayerMsg, dragType } from '../../../assets/strings';
export const dataType = dragType.player;

// Helpers for swapping player arrays during optimistic updates

export const swapPlayerArrays = (baseArr, swapArr, swapIndxes, baseKey = 'players', swapIdKey = 'id') => {
  [ baseArr[swapArr[0][swapIdKey]][baseKey][swapIndxes[0]], baseArr[swapArr[1][swapIdKey]][baseKey][swapIndxes[1]] ] =
  [ baseArr[swapArr[1][swapIdKey]][baseKey][swapIndxes[1]], baseArr[swapArr[0][swapIdKey]][baseKey][swapIndxes[0]] ];
}

export const moveDrops = (baseArr, fromId, toId, moveValue, baseKey = 'drops') => {
  const idx = baseArr[fromId][baseKey].indexOf(moveValue);
  if (idx !== -1)
    baseArr[toId][baseKey].push(baseArr[fromId][baseKey].splice(idx,1)[0]);
}

// Construct swap handler
export const swapController = (swapPlayers, eventid) => (playerA, playerB) => {
  if (playerA.id === playerB.id) return;
  if ((playerA.reported || playerB.reported) && !window.confirm(swapPlayerMsg())) return;
  swapPlayers({eventid, swap: [ playerA, playerB ] });
};

// Test if swap is allowed
export const canSwap = (types, a, b) => a !== b && types.includes(dataType);