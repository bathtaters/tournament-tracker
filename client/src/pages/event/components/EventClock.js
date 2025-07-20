import React from "react";
import { hasEnded, useTimer } from "../services/clock.services";
import { useClockActionMutation } from "../event.fetch";
import { useAccessLevel } from "../../common/common.fetch";
import {
  ClockWrapper,
  ClockStyle,
  ButtonsWrapper,
  ButtonStyle,
  buttonIcons,
} from "../styles/ClockStyles";

export default function EventClock({ id, state, remaining, end }) {
  // State cheat sheet = [0: stopped, 1: running, 2: paused]
  const { access } = useAccessLevel();
  const [clockAction, { isLoading }] = useClockActionMutation();
  const timer = useTimer(end, remaining);

  if (!timer) return null;

  const isComplete = hasEnded(end, remaining);

  return (
    <ClockWrapper isRed={isComplete}>
      {timer && <ClockStyle timer={timer} paused={state === 2} />}
      {access > 1 && (
        <ButtonsWrapper>
          {/* START */}
          {state !== 1 && (
            <ButtonStyle
              icon={buttonIcons.run}
              disabled={isLoading || isComplete}
              onClick={() => clockAction({ id, action: "run" })}
            />
          )}
          {/* PAUSE */}
          {state === 1 && (
            <ButtonStyle
              icon={buttonIcons.pause}
              disabled={isLoading}
              onClick={() => clockAction({ id, action: "pause" })}
            />
          )}
          {/* RESTART */}
          <ButtonStyle
            icon={buttonIcons.reset}
            disabled={isLoading}
            onClick={() => clockAction({ id, action: "reset" })}
          />
        </ButtonsWrapper>
      )}
    </ClockWrapper>
  );
}
