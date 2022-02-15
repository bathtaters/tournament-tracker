import React from "react";

import { HeaderStyle, TitleStyle, HeaderButton } from "../styles/ScheduleStyles";

function ScheduleHeader({ isEditing, isLoading, setEdit, openModal }) {
  return (
    <HeaderStyle>
      <HeaderButton
        value="+"
        onClick={() => openModal()}
        disabled={isLoading}
      />
      <TitleStyle>Schedule</TitleStyle>
      <HeaderButton
        value={isEditing ? 'Back' : 'Edit'}
        onClick={()=>setEdit(!isEditing)}
        disabled={isLoading}
      />
    </HeaderStyle>
  );
}

export default ScheduleHeader;