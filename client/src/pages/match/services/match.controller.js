import { useModal } from "../../common/Modal"
import { useOpenAlert, useLockScreen } from "../../common/common.hooks"
import { 
  useMatchQuery, useReportMutation,
  useUpdateMatchMutation, 
  useSwapPlayersMutation,
  useUpdateDropsMutation,
  useStatsQuery, usePlayerQuery
} from "../match.fetch"
import { useSessionState, useShowRaw } from "../../common/common.fetch"

import { getMatchTitle } from "./match.services"
import { swapController, canSwap } from "./swap.services"

import { clearReportAlert } from '../../../assets/alerts'
import { reportLockCaption } from "../../../assets/constants"
import { apiPollMs } from "../../../assets/config"

// Get max possible draws
import { getLimit } from "../../../core/services/validation.services"
const maxDraws = getLimit('match','setDrawsMax') ?? 0

export default function useMatchController(eventid, matchId) {
  // Base Hooks
  const openAlert = useOpenAlert();
  const reportModal = useModal();

  // Query Hooks
  const { data: matches,  isLoading: loadingMatch,   error: matchError  } = useMatchQuery(eventid, { pollingInterval: apiPollMs })
  const { data: rankings, isLoading: loadingRank,    error: rankError   } = useStatsQuery(eventid, { pollingInterval: apiPollMs })
  const { data: players,  isLoading: loadingPlayers, error: playerError } = usePlayerQuery()
  const { data: user } = useSessionState()
  const showRaw = useShowRaw()

  // Mutation Hooks
  const [ update ] = useUpdateMatchMutation()
  const [ swapPlayers ] = useSwapPlayersMutation()
  const [ updateDrops ] = useUpdateDropsMutation()
  const [ report, { isLoading: isReporting } ] = useReportMutation()
  const [ isLocked ] = useLockScreen(isReporting, reportLockCaption)

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
    matchData, rankings, players, showRaw,
    title, isLocked, reportModal, maxDraws,
    showReport: user?.id && (user.access > 1 || matchData.players.includes(user.id)),
    
    // Mutators
    clearReport, report,

    // Change reported values
    setVal: (key) => (value) => update({ id: matchData.id, eventid, key, value }),

    // Data for swapping players
    swapProps: { matchData, canSwap,
      // Swap players
      handleSwap: swapController(swapPlayers, eventid, openAlert),

      // Un/Drop players
      handleDrop: (playerid, undrop) => updateDrops({ id: matchId, playerid, undrop, eventid }),
    },
  }
}