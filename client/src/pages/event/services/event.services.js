import { useState } from "react";
import { useDispatch } from "react-redux";
import { useMatchQuery, usePlayerQuery, refetchStats } from '../event.fetch';
import { useAccessLevel } from "../../common/common.fetch";
import { formatCopyRound } from "../../../assets/formatting";

// Round Editor controller
export function useRoundEditor({ id, roundactive, matches }, round) {
  // Setup
  const dispatch = useDispatch()
  const { access } = useAccessLevel()
  const [isEditing, setIsEditing] = useState(false)

  // Copy matches
  const { data: matchData } = useMatchQuery(id)
  const { data: playerData } = usePlayerQuery()
  const handleCopy = !playerData || !matchData || round + 1 !== roundactive ? null :
    () => navigator.clipboard.writeText(formatCopyRound(matches[round], matchData, playerData))

  // Refetch Stats
  const setEditing = (isEditing) => {
    !isEditing && dispatch(refetchStats(id))
    setIsEditing(isEditing)
  }

  return { isEditing, setEditing, showEdit: access > 1, handleCopy }
}


// Build array of round numbers
export function roundArray(matchCount) {
  let rounds = [];
  for (let roundNum = matchCount || 0; roundNum > 0; roundNum--) {
    rounds.push(roundNum);
  }
  return rounds;
}


// Generate temp round
export const fakeRound = (eventData) => {
  const playerCount = 
    (eventData.players ? eventData.players.length : 0) -
    (eventData.drops ? eventData.drops.length : 0);
  let round = [], size = eventData.playerspermatch ? Math.ceil(playerCount/eventData.playerspermatch) : 0;
  for (let i=0; i<size; i++) {
    round.push('TBD-'+i);
  }
  return round;
};

