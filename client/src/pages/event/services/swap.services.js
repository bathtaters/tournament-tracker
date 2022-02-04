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