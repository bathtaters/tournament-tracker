import { useNextRoundMutation, useClearRoundMutation } from "../event.fetch";
import { useLockScreen } from "../../common/common.fetch";
import { roundButtonText } from "../../../assets/strings";

// Get Round Button label
// [0: N/A, 1: Start, 2: Not Reported, 3: Last, 4: Next, 5: End, 6: Complete]
const getRoundButton = (event, isLocked) => roundButtonText[
  !event || isLocked || !event.players?.length ? 0 :
  event.roundactive === 0 ? 1 :
  event.roundactive > event.roundcount ? 6 :
  event.allreported === false ? (event.anyreported === true ? 2 : 3) :
  event.roundactive === event.roundcount ? 5 : 4
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
  const isLocked = useLockScreen(isLoading)

  // Get button status
  const disableButton = disabled || isLocked || disableRound(event)

  return {
    handleClick: disableButton ? null : isNext(event) ? ()=>nextRound(event.id) : ()=>clearRound(event.id),
    buttonText: getRoundButton(event, isLocked),
    isLoading
  }
}