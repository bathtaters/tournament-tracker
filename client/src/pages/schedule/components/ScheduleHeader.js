import React, { useRef } from "react";

import Settings from "../../settings/Settings";
import Modal from "../../common/Modal";
import { HeaderStyle, TitleStyle, HeaderButton } from "../styles/ScheduleStyles";

function ScheduleHeader({ isEditing, isLoading, setEdit, openModal }) {
  const modal = useRef(null);
    
  return (
    <HeaderStyle>
      <HeaderButton
        value={isEditing ? '⚙' : '＋'}
        onClick={() => isEditing ? modal.current.open() : openModal()}
        disabled={isLoading}
      />
      <TitleStyle>Schedule</TitleStyle>
      <HeaderButton
        value={isEditing ? 'Back' : 'Edit'}
        onClick={()=>setEdit(!isEditing)}
        disabled={isLoading}
      />

      <Modal ref={modal}>
        <Settings modal={modal} />
      </Modal>
    </HeaderStyle>
  );
}

export default ScheduleHeader;