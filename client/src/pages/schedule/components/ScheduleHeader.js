import React, { useRef } from "react";
import Settings from "../../settings/Settings";
import Modal from "../../common/Modal";
import { HeaderStyle, TitleStyle, HeaderButton } from "../styles/ScheduleStyles";
import { useAccessLevel } from "../../common/common.fetch";

function ScheduleHeader({ isEditing, setEdit, openModal }) {
  const { access } = useAccessLevel();
  const modal = useRef(null);
    
  return (
    <HeaderStyle>
      {access > 1 &&
        <HeaderButton
          onClick={()=>openModal()}
        >
          ＋
        </HeaderButton>
      }

      <TitleStyle>Schedule</TitleStyle>
      
      {access > 1 &&
        <HeaderButton
          onClick={()=>setEdit(!isEditing)}
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