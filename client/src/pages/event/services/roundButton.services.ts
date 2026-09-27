import type { EventData } from "types/models";
import {
  useLockScreen,
  useOpenAlert,
} from "../../../common/General/common.hooks";
import { useClearRoundMutation, useNextRoundMutation } from "../event.fetch";
import { deleteRoundAlert } from "../../../assets/alerts";
import {
  roundButtonLockCaption,
  roundButtonText,
  roundThresholdMsg,
} from "../../../assets/constants";
import { metadata } from "../../../core/services/validation.services";
import { debugLogging } from "../../../assets/config";

// Get Round Button label
//  none|begin|end|back|next|wait|done
const getRoundButton = (event: Partial<EventData>, isLocked = false) => {
  if (isLocked) return roundButtonText.wait;
  if (!event?.players?.length) return roundButtonText.none;
  if (event.roundactive === 0)
    return event.roundcount === 0 ? roundButtonText.end : roundButtonText.begin;
  if (event.roundactive > event.roundcount) return roundButtonText.done;
  if (event.allreported === false)
    return event.anyreported === true
      ? roundButtonText.wait
      : roundButtonText.back;
  if (event.roundactive === event.roundcount) return roundButtonText.end;
  return roundButtonText.next;
};

// Check if event is over
export const isFinished = (event: Partial<EventData>) =>
  Boolean(event && event.roundactive > event.roundcount);

// Check if button should get Next round
const isNext = ({ allreported, status }: Partial<EventData>) =>
  allreported || status === 1;

// Check if RoundButton should be disabled
const disableRound = ({
  allreported,
  anyreported,
  status,
  players,
}: Partial<EventData>) =>
  status > 2 ||
  !players?.length ||
  (allreported === false && anyreported === true);

// Round Button controller
export default function useRoundButton(
  event: Partial<EventData>,
  disabled: boolean,
) {
  // Setup hooks
  const deleteRound = useDeleteRound(event);
  const [nextRound, { isLoading }] = useNextRoundMutation();

  // Get fetching status
  const isFetching = isLoading && event.roundactive !== event.roundcount + 1;
  const [isLocked, lock] = useLockScreen(isFetching, roundButtonLockCaption[0]);

  // Get button status
  const disableButton = disabled || isLocked || disableRound(event);

  // Show warning?
  const showWarning =
    event?.players?.length &&
    event.players.length > metadata.pairingThreshold &&
    event.status === 2 &&
    isNext(event);

  return {
    handleClick: disableButton
      ? null
      : isNext(event)
        ? () => {
            lock();
            nextRound({ id: event.id, roundactive: event.roundactive });
          }
        : deleteRound,

    buttonText: getRoundButton(event, isLocked),
    buttonWarning: showWarning ? roundThresholdMsg : null,
  };
}

// Delete Round controller
export function useDeleteRound({
  id,
  anyreported,
  roundactive,
}: Partial<EventData> = {}) {
  const openAlert = useOpenAlert();
  const [prevRound, { isLoading }] = useClearRoundMutation();

  const lock = useLockScreen(isLoading, roundButtonLockCaption[1])[1];

  // Confirm id isn't missing
  return () => {
    // Missing ID guard
    if (!id) {
      if (debugLogging) console.warn("Delete round is missing id.");

      // If no data saved yet, go back w/o asking
    } else if (!anyreported) {
      lock();
      prevRound({ id, roundactive });

      // Otherwise confirm deleting round data
    } else {
      openAlert(deleteRoundAlert, 0).then((r) => {
        if (r) {
          lock();
          prevRound({ id, roundactive });
        }
      });
    }
  };
}
