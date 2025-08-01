import { useOpenAlert, useLockScreen } from "../../common/common.hooks";
import { useNextRoundMutation, useClearRoundMutation } from "../event.fetch";

import { deleteRoundAlert } from "../../../assets/alerts";
import {
  roundButtonText,
  roundButtonLockCaption,
  roundThresholdMsg,
} from "../../../assets/constants";
import { metadata } from "../../../core/services/validation.services";
import { debugLogging } from "../../../assets/config";

// Get Round Button label
//  none|begin|end|back|next|wait|done
const getRoundButton = (event, isLocked = false) =>
  roundButtonText[
    isLocked
      ? "wait"
      : !event || !event.players?.length
        ? "none"
        : event.roundactive === 0
          ? "begin"
          : event.roundactive > event.roundcount
            ? "done"
            : event.allreported === false
              ? event.anyreported === true
                ? "wait"
                : "back"
              : event.roundactive === event.roundcount
                ? "end"
                : "next"
  ];

// Check if event is over
export const isFinished = (event) =>
  Boolean(event && event.roundactive > event.roundcount);

// Check if button should get Next round
const isNext = ({ allreported, status }) => allreported || status === 1;

// Check if RoundButton should be disabled
const disableRound = ({ allreported, anyreported, status, players }) =>
  status > 2 ||
  !players?.length ||
  (allreported === false && anyreported === true);

// Round Button controller
export default function useRoundButton(event, disabled) {
  // Setup hooks
  const deleteRound = useDeleteRound(event);
  const [nextRound, { isLoading }] = useNextRoundMutation();

  // Get fetching status
  const isFetching = isLoading && event.roundactive !== event.roundcount + 1;
  const [isLocked, lock] = useLockScreen(isFetching, roundButtonLockCaption);

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

// Delete Round contoller
export function useDeleteRound({ id, anyreported, roundactive } = {}) {
  const [prevRound] = useClearRoundMutation();
  const openAlert = useOpenAlert();

  // Confirm id isn't missing
  return () =>
    !id
      ? debugLogging && console.warn("Delete round is missing id.")
      : // If no data saved yet, go back w/o asking
        !anyreported
        ? prevRound({ id, roundactive })
        : // Otherwise confirm deleting round data
          openAlert(deleteRoundAlert, 0).then(
            (r) => r && prevRound({ id, roundactive })
          );
}
