import { useNextRoundMutation, useClearRoundMutation } from "../event.fetch";
import { useLockScreen } from "../../common/common.fetch";
import { roundButtonText } from "../../../assets/strings";

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
  status > 2 || !players?.length || (allreported === false && anyreported == true)


// Round Button controller
export default function useRoundButton(event, disabled) {
  // Setup hooks
  const [ nextRound, { isLoading } ] = useNextRoundMutation()
  const [ clearRound ] = useClearRoundMutation()
  
  // Get fetching status
  const isFetching = isLoading && event.roundactive !== event.roundcount + 1
  const isLocked = useLockScreen(isFetching)

  // Get button status
  const disableButton = disabled || isLocked || disableRound(event)

  return {
    handleClick: disableButton ? null : isNext(event) ? ()=>nextRound(event.id) : ()=>clearRound(event.id),
    buttonText: getRoundButton(event, isLocked),
    isFetching
  }
}