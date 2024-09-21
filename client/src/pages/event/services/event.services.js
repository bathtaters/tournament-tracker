import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useMatchQuery, usePlayerQuery, refetchStats, useClockQuery } from '../event.fetch';
import { useAccessLevel } from "../../common/common.fetch";
import { clockPoll, isZero } from './clock.services';
import { formatCopyRound, formatCopySeats } from "../../../assets/formatting";
import { apiPollMs } from "../../../assets/config";

// Round Editor controller
export function useRoundEditor({ id, roundactive, matches, playerspermatch }, round) {
  // Setup
  const dispatch = useDispatch()
  const { access } = useAccessLevel()
  const [isEditing, setIsEditing] = useState(false)

  // Copy matches
  const { data: matchData } = useMatchQuery(id, { pollingInterval: apiPollMs })
  const { data: playerData } = usePlayerQuery()
  
  const handleCopy = !playerData || !matchData || round + 1 !== roundactive ? null :
    () => navigator.clipboard.writeText(formatCopyRound(matches[round], matchData, playerData))
  const handleCopySeats = !playerData || !matchData || round || roundactive !== 1 ? null :
    () => navigator.clipboard.writeText(formatCopySeats(matches[round], matchData, playerData, playerspermatch))

  // Refetch Stats
  const setEditing = (isEditing) => {
    !isEditing && dispatch(refetchStats(id))
    setIsEditing(isEditing)
  }

  return { isEditing, setEditing, showEdit: access > 1, handleCopy, handleCopySeats }
}

export function useEventClock(id, status = 0, eventClock = null, defaultPoll = 0) {
  const [ pollingInterval, setPoll ] = useState(defaultPoll);
  const { data, error, isLoading } = useClockQuery(id, { skip: !id, pollingInterval })

  useEffect(() => {
    if (data) {
      setPoll(isZero(eventClock) ? 0 : clockPoll(data.state, status))
    }
  }, [data, status, eventClock]);
  return { data, error, isLoading }
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

