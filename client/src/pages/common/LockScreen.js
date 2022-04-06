import React from "react";
import { useSelector } from "react-redux";

import OverlayContainer from "./components/OverlayContainer";
import LoadingSpinner from "./components/LoadingSpinner";
import { WheelWrapperStyle, CaptionStyle, overlayStyle } from "./styles/LockScreenStyles";

export default function LockScreen() {
  const { isLocked, caption } = useSelector((state) => state.global.lockScreen)

  return isLocked && (
    <OverlayContainer className={overlayStyle}>
      <WheelWrapperStyle>

        <LoadingSpinner size={18} weight={8} />

        { caption && <CaptionStyle>{caption}</CaptionStyle> }

      </WheelWrapperStyle>
    </OverlayContainer>
  )
}