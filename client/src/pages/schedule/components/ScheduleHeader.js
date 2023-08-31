import React, { useRef } from "react";

import Settings from "../../settings/Settings";
import Modal from "../../common/Modal";
import SettingsIcon from "../../common/icons/SettingsIcon";
import { HeaderStyle, TitleStyle, HeaderButton } from "../styles/ScheduleStyles";

function ScheduleHeader({ isEditing, isLoading, access, setEdit, openModal }) {
  const modal = useRef(null);
    
  return (
    <HeaderStyle>
      {access > 1 &&
        <HeaderButton
          onClick={() => access > 2 && isEditing ? modal.current.open() : openModal()}
          disabled={isLoading}
        >
          {access > 2 && isEditing ? <SettingsIcon /> : '＋'}
        </HeaderButton>
      }

      <TitleStyle>Schedule</TitleStyle>
      
      {access > 1 &&
        <HeaderButton
          onClick={()=>setEdit(!isEditing)}
          disabled={isLoading}
        >
          {isEditing ? 'Back' : 'Edit'}
        </HeaderButton>
      }

      <Modal ref={modal}>
        <Settings modal={modal} />
      </Modal>
    </HeaderStyle>
  );
}

export default ScheduleHeader;