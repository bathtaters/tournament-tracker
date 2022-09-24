import { useOpenAlert, useLockScreen } from "../../common/common.hooks";
import { useNextRoundMutation, useClearRoundMutation } from "../event.fetch";

import { deleteRoundAlert } from "../../../assets/alerts";
import { roundButtonText, roundButtonLockCaption } from "../../../assets/constants";
import { debugLogging } from "../../../assets/config";

// Get Round Button label
//  none|begin|end|back|next|wait|done
const getRoundButton = (event, isLocked) => roundButtonText[
  isLocked ? 'wait' :
  !event || !event.players?.length ? 'none' :
  event.roundactive === 0 ? 'begin' :
  event.roundactive > event.roundcount ? 'done' :
  event.allreported === false ?
    (event.anyreported === true ? 'wait' : 'back') :
  event.roundactive === event.roundcount ? 'end' : 'next'
]

// Check if button should get Next round
const isNext = ({ allreported, status }) =>  allreported || status === 1

// Check if RoundButton should be disabled
const disableRound = ({ allreported, anyreported, status, players }) =>
  status > 2 || !players?.length || (allreported === false && anyreported === true)


// Round Button controller
export default function useRoundButton(event, disabled) {
  // Setup hooks
  const deleteRound = useDeleteRound(event)
  const [ nextRound, { isLoading } ] = useNextRoundMutation()
  
  // Get fetching status
  const isFetching = isLoading && event.roundactive !== event.roundcount + 1
  const isLocked = useLockScreen(isFetching, roundButtonLockCaption)

  // Get button status
  const disableButton = disabled || isLocked || disableRound(event)

  return {
    handleClick: disableButton ? null :
      isNext(event) ? () => nextRound({ id: event.id, roundactive: event.roundactive }) : deleteRound,

    buttonText: getRoundButton(event, isLocked),
  }
}

// Delete Round contoller
export function useDeleteRound({ id, anyreported, roundactive } = {}) {
  const [ prevRound ] = useClearRoundMutation()
  const openAlert = useOpenAlert()
  
  // Confirm id isn't missing
  return () => !id ? debugLogging && console.warn('Delete round is missing id.') :
    
    // If no data saved yet, go back w/o asking
    !anyreported ? prevRound({ id, roundactive }) :

    // Otherwise confirm deleting round data
    openAlert(deleteRoundAlert,0).then(r => r && prevRound({ id, roundactive }))
}