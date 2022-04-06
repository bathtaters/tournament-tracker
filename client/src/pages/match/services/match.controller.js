import { useRef } from "react"
import { useOpenAlert, useLockScreen } from "../../common/common.hooks"
import { 
  useMatchQuery, useReportMutation,
  useUpdateMatchMutation, 
  useSwapPlayersMutation,
  useUpdateDropsMutation,
  useStatsQuery, useSettingsQuery,
  usePlayerQuery
} from "../match.fetch"

import { getMatchTitle } from "./match.services"
import { swapController, canSwap } from "./swap.services"

import { clearReportAlert } from '../../../assets/alerts'
import { reportLockCaption } from "../../../assets/constants"
import valid from "../../../assets/validation.json"


export default function useMatchController(eventid, matchId) {
  // Base Hooks
  const reportModal = useRef(null);
  const openAlert = useOpenAlert();

  // Query Hooks
  const { data: matches,  isLoading: loadingMatch,   error: matchError  } = useMatchQuery(eventid)
  const { data: rankings, isLoading: loadingRank,    error: rankError   } = useStatsQuery(eventid)
  const { data: players,  isLoading: loadingPlayers, error: playerError } = usePlayerQuery()
  const { data: settings } = useSettingsQuery()

  // Mutation Hooks
  const [ update ] = useUpdateMatchMutation()
  const [ swapPlayers ] = useSwapPlayersMutation()
  const [ updateDrops ] = useUpdateDropsMutation()
  const [ report, { isLoading: isReporting } ] = useReportMutation()
  const isLocked = useLockScreen(isReporting, reportLockCaption)

  // Catch loading/error
  const matchData = matches?.[matchId], error = matchError || rankError || playerError
  if (loadingMatch || loadingRank || loadingPlayers || !matchData || error) return { showLoading: true, error }

  // Get match title
  const title = getMatchTitle(matchData, players);
  
  // UnReport match
  const clearReport = () =>
    openAlert(clearReportAlert(title), 0)
      .then(r => r && report({ id: matchData.id, eventid, clear: true }));

  return {
    // Base data
    matchData, rankings, players, settings,
    title, isLocked, reportModal,
    // Mutators
    clearReport, report,

    // Change reported values
    setVal: (key) => (value) => update({ id: matchData.id, eventid, key, value }),

    // Get max possible draws
    maxDraws: valid.limits.match.setDrawsMax || 0,

    // Data for swapping players
    swapProps: { matchData, canSwap,
      // Swap players
      handleSwap: swapController(swapPlayers, eventid, openAlert),

      // Un/Drop players
      handleDrop: (playerid, undrop) => updateDrops({ id: matchId, playerid, undrop, eventid }),
    },
  }
}