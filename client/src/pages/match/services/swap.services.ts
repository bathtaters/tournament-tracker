import type { Match, MatchData } from "types/models";
import type { AlertOptions, SwapDragData } from "types/base";
import type { SwapPlayerBody } from "types/api";
import { swapPlayerAlert } from "../../../assets/alerts";
import { dragType } from "../../../assets/constants";

export const dataType = dragType.player;

// Helpers for swapping player arrays during optimistic updates

export const swapPlayerArrays = (
  baseArr: Record<MatchData["id"], MatchData>,
  swapArr: [SwapDragData, SwapDragData],
  swapIndexes: [number, number],
  baseKey: keyof MatchData = "players",
  swapIdKey: Exclude<keyof SwapDragData, "reported"> = "id",
) => {
  [
    baseArr[swapArr[0][swapIdKey]][baseKey][swapIndexes[0]],
    baseArr[swapArr[1][swapIdKey]][baseKey][swapIndexes[1]],
  ] = [
    baseArr[swapArr[1][swapIdKey]][baseKey][swapIndexes[1]],
    baseArr[swapArr[0][swapIdKey]][baseKey][swapIndexes[0]],
  ];
};

export const moveDrops = (
  baseArr: Record<MatchData["id"], MatchData>,
  fromId: MatchData["id"],
  toId: MatchData["id"],
  moveValue: MatchData["drops"][number],
) => {
  const idx = baseArr[fromId].drops.indexOf(moveValue);
  if (idx !== -1) {
    const playerId = baseArr[fromId].drops.splice(idx, 1)[0];
    if (baseArr[toId].reported) baseArr[toId].drops.push(playerId);
  }
};

// Construct swap handler
export const swapController =
  (
    swapPlayers: (body: SwapPlayerBody) => any,
    eventid: Match["eventid"],
    openAlert: (
      alert: AlertOptions,
      expectedIdx: number,
    ) => Promise<string | boolean>,
  ) =>
  async (playerA: SwapDragData, playerB: SwapDragData) => {
    if (playerA.playerid === playerB.playerid) return;
    const doSwap =
      (!playerA.reported && !playerB.reported) ||
      (await openAlert(swapPlayerAlert, 0));
    if (doSwap) swapPlayers({ eventid, swap: [playerA, playerB] });
  };

// Test if swap is allowed
export const canSwap = (type: string, a: SwapDragData, b: SwapDragData) =>
  type === dataType && a.playerid !== b.playerid;
