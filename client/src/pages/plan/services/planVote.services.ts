import type { MouseEvent } from "react";
import type { EventData, Player, Voter, Settings } from "types/models";
import { useCallback, useMemo } from "react";
import { useScheduleQuery } from "../../schedule/schedule.fetch";
import { boxIDs, dragType } from "../../../assets/constants";
import {
  arrInsert,
  arrRemove,
  arrShift,
  arrSwap,
  dateRangeList,
  trimFalsy,
} from "./plan.utils";
import { useServerListValue } from "../../../common/General/common.hooks";
import { noDate } from "../../schedule/services/date.utils";
import { plan as config } from "../../../assets/config";

export type DragItem = { id: string; boxId: string; slot?: number };

// Constants
export const dataType: string = dragType.vote;

// Drag & Drop tester
export const canDrop = (type: string, a: DragItem, b: DragItem) =>
  type === dataType &&
  a.id !== b.id &&
  (a.boxId !== boxIDs.UNRANKED || a.boxId !== b.boxId);

// Drag controller
export function useRankState(
  voter: Voter,
  updateVoter: (patch: { id: Voter["id"]; events: Voter["events"] }) => any,
) {
  const [ranked, setRanked] = useServerListValue(
    voter?.events,
    (events) => updateVoter({ id: voter?.id, events }),
    { throttleDelay: config.updateDelay },
  );

  // from/to form: {id, boxId, slot}
  const handleDrop = useCallback(
    (from: DragItem, to: DragItem) => {
      if (from.boxId === to.boxId) {
        to.boxId === boxIDs.RANKED &&
          setRanked((ranked) => arrSwap(ranked, [from.slot, to.slot]));
        return;
      }

      setRanked((ranked) =>
        to.boxId === boxIDs.RANKED
          ? arrInsert(ranked, to.slot, from.id)
          : arrRemove(ranked, from.slot),
      );
    },
    [setRanked],
  );

  // idx of -1 means unranked, shift of 0 means move to unranked (otherwise expect +1/-1)
  const handleClick = useCallback(
    (ev: MouseEvent, id: string, idx: number, shift = 0) => {
      ev.stopPropagation();
      if (idx === -1) return setRanked((ranked) => ranked.concat(id));
      if (shift === 0)
        return setRanked((ranked) =>
          trimFalsy(ranked.filter((event) => event !== id)),
        );
      setRanked((ranked) => arrShift(ranked, idx, shift < 0));
    },
    [setRanked],
  );

  return {
    ranked,
    handleDrop,
    handleClick,
  };
}

// Calculate scores
export function useVoterScores(
  voters: Record<Voter["id"], Voter>,
  events: Record<EventData["id"], EventData>,
  players: Record<Player["id"], Player>,
  { plandates }: Partial<Pick<Settings, "plandates">>,
  skip: boolean,
) {
  const { data: schedule, isLoading, error } = useScheduleQuery(true, { skip });
  const ignore = skip || isLoading,
    message = error
      ? error
      : !schedule || !voters
        ? "Score data unable to be retrieved"
        : null;

  return useMemo(() => {
    if (ignore) return {};
    if (message) return { errors: [String(message)] };

    // Create response objects
    const unvotedPenalty = -2,
      scores: VoterScores = Object.fromEntries(
        Object.keys(voters).map((id) => [
          id,
          {
            regCount: 0, // Events registered for
            rankSum: 0, // Combined rankings
            score: 0.0, // Unweighted 'score'
            weighted: 0.0, // Score accounting for days off
            voteCount: voters[id].events.length, // Events voted for
            offDays: 0, // Number of days off
            events: [], // List of Event IDs
          },
        ]),
      ),
      totals: VoterTotals = {
        scheduled: 0, // Total number of scheduled events
        days: dateRangeList(plandates[0], plandates[1]), // List of all dates
        // Total number of events
        events: Math.max(
          ...Object.values(voters).map(({ events }) => events.length),
        ),
      },
      errors: string[] = [];

    for (const day of schedule) {
      for (const eventId of day.events) {
        // Skip empty slots, unscheduled events, & missing events
        if (!eventId || day.day === noDate) continue;
        if (!(eventId in events)) {
          errors.push(`Found unknown event (${eventId})`);
          continue;
        }
        totals.scheduled += 1;
        for (const player of events[eventId].players) {
          // Skip non-voter players
          if (!(player in scores)) {
            errors.push(`${players[player]?.name || player} did not vote`);
            continue;
          }
          // Raise alert if player is scheduled on their off day
          if (voters[player].days.includes(day.day))
            errors.push(
              `${players[player]?.name || player} scheduled on off day (${day.day})`,
            );

          // Add to rankings, register counter, and events array
          const rank = voters[player].events.indexOf(eventId);
          scores[player].rankSum +=
            rank === -1 ? unvotedPenalty : totals.events - rank;
          scores[player].regCount += 1;
          scores[player].events.push(eventId);
        }
      }
    }

    // Scale & Weight data to balance/normalize scores
    const minScore = totals.scheduled * -unvotedPenalty;
    const maxScore = minScore + (totals.events * (totals.events + 1)) / 2;

    const offDayWeights: Record<string, number> = {};
    let totalWeight = 0;

    for (const player in scores) {
      // Subtract the number of unused votes to create a player-specific maximum, for more balanced scoring
      const unusedVotes = totals.events - scores[player].voteCount;
      const playerMax = maxScore - (unusedVotes * (unusedVotes + 1)) / 2;
      scores[player].score = (scores[player].rankSum + minScore) / playerMax;

      // Calculate a weight factor based on days off (More days off = higher factor)
      scores[player].offDays = voters[player].days.filter((day) =>
        totals.days.includes(day),
      ).length;
      const offDayRatio = scores[player].offDays / totals.days.length;
      const weightFactor = 1 + offDayRatio; // Linear scaling based on percentage of days off

      offDayWeights[player] = weightFactor;
      totalWeight += weightFactor;
    }

    // Normalize weights to ensure they sum to the number of players
    // This keeps the average weight at 1.0
    const normalizationFactor = Object.keys(scores).length / (totalWeight || 1);

    // Apply normalized weights to scores
    for (const player in scores) {
      const normalizedWeight = offDayWeights[player] * normalizationFactor;

      // Apply weight to score, ensuring it stays within 0-1 range
      scores[player].weighted = Math.min(
        1.0,
        Math.max(0, scores[player].score * normalizedWeight),
      );
    }

    return { scores, totals, errors };
  }, [schedule, voters, events, players, plandates, ignore, message]);
}

// Voter Score types

export type ScoreEntry = {
  regCount: number;
  rankSum: number;
  score: number;
  weighted: number;
  voteCount: number;
  offDays: number;
  events: EventData["id"][];
};

export type VoterScores = Record<Voter["id"], ScoreEntry>;

export type VoterTotals = {
  scheduled: number;
  days: string[];
  events: number;
};
