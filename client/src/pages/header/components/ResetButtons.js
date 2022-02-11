import React from "react";

import { ResetButtonStyle } from "../styles/SettingsStyles";
import { useResetDbMutation } from "../header.fetch";

// Single settings menu button w/ style
function SettingsButton({ onClick, value }) {
  return (
    <input
      className="w-20 h-8 mx-1 sm:w-28 sm:h-11 sm:mx-4"
      type="button"
      value={value}
      onClick={onClick}
    />
  );
}

// Render temporary 'Reset' buttons
function ResetButtons() {
  const [ resetDb ] = useResetDbMutation();
  return (
    <ResetButtonStyle>
      <SettingsButton value="Reset Data" onClick={()=>resetDb(false)} />
      <SettingsButton value="Full Reset" onClick={()=>resetDb(true)}  />
    </ResetButtonStyle>
  );
}

export default ResetButtons;