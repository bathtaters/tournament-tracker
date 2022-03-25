import React from "react";

import OverlayContainer from "./components/OverlayContainer";
import LoadingSpinner from "./components/LoadingSpinner";
import { WheelWrapperStyle, CaptionStyle, overlayStyle } from "./styles/LoadingScreenStyles";

import { useLockScreen } from "./common.fetch";

export default function LoadingScreen({ enable, caption }) {
  const lockScreen = useLockScreen(enable)

  return lockScreen && (
    <OverlayContainer className={overlayStyle}>
      <WheelWrapperStyle>

        <LoadingSpinner size={18} weight={8} />

        <CaptionStyle>{caption}</CaptionStyle>

      </WheelWrapperStyle>
    </OverlayContainer>
  )
}