import { useState } from "react";
import { useDispatch } from "react-redux";
import { useMatchQuery, usePlayerQuery, useSettingsQuery, refetchStats } from '../event.fetch';

// Round Editor controller
export function useRoundEditor({ id, roundactive, anyreported, matches }, round) {
  // Setup
  const dispatch = useDispatch()
  const { data } = useSettingsQuery()
  const [isEditing, setIsEditing] = useState(false)

  // Copy matches
  const { data: matchData } = useMatchQuery(id)
  const { data: playerData } = usePlayerQuery()
  const handleCopy = !playerData || !matchData || round + 1 !== roundactive ? null :
    () => navigator.clipboard.writeText(roundText(matches[round], matchData, playerData))

  // Refetch Stats
  const setEditing = (isEditing) => {
    !isEditing && dispatch(refetchStats(id))
    setIsEditing(isEditing)
  }

  const showAdvanced = data?.showadvanced || (roundactive === round + 1 && !anyreported)

  return { isEditing, setEditing, showAdvanced, handleCopy, showDelete: data?.showadvanced }
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

// Format text of the round's matchups
const roundText = (matchList, matches, players) => matchList.map(
  (matchId) => matches[matchId]?.players.map(
    (playerId) => players[playerId]?.name
  ).join(' vs. ')
).join('\n')