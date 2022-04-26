import React, { useRef } from "react";

import Settings from "../../settings/Settings";
import Modal from "../../common/Modal";
import SettingsIcon from "../../common/icons/SettingsIcon";
import { HeaderStyle, TitleStyle, HeaderButton } from "../styles/ScheduleStyles";

function ScheduleHeader({ isEditing, isLoading, setEdit, openModal }) {
  const modal = useRef(null);
    
  return (
    <HeaderStyle>
      <HeaderButton
        onClick={() => isEditing ? modal.current.open() : openModal()}
        disabled={isLoading}
      >
        {isEditing ? <SettingsIcon /> : '＋'}
      </HeaderButton>

      <TitleStyle>Schedule</TitleStyle>

      <HeaderButton
        onClick={()=>setEdit(!isEditing)}
        disabled={isLoading}
      >
        {isEditing ? 'Back' : 'Edit'}
      </HeaderButton>

      <Modal ref={modal}>
        <Settings modal={modal} />
      </Modal>
    </HeaderStyle>
  );
}

export default ScheduleHeader;