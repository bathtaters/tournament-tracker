import React from "react";
import LoadingScreen from "../../common/LoadingScreen";
import { ResetButtonStyle } from "../styles/SettingsStyles";
import { useResetHandler } from "../services/settings.services";

// Single settings menu button w/ style
function SettingsButtons({ onClick, value }) {
  return (
    <input
      className="w-20 h-8 mx-1 sm:w-28 sm:h-11 sm:mx-4"
      type="button"
      value={value}
      onClick={onClick}
    />
  );
}

// Render 'Reset' buttons + Logic
function ResetButtons({ closeModal }) {

  const [resetHandler, isLoading] = useResetHandler(closeModal)

  return (<>
    <ResetButtonStyle>
      <SettingsButtons value="Reset Data" onClick={()=>resetHandler(false)} />
      <SettingsButtons value="Full Reset" onClick={()=>resetHandler(true)}  />
    </ResetButtonStyle>

    <LoadingScreen enable={isLoading} caption="Resetting data..." />
  </>);
}

export default ResetButtons;