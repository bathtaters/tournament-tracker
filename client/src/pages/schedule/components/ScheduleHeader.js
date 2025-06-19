import { HeaderStyle, TitleStyle, HeaderButton } from "../styles/ScheduleStyles";
import { useAccessLevel } from "../../common/common.fetch";

function ScheduleHeader({ isEditing, setEdit, openModal }) {
  const { access } = useAccessLevel();
    
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
    </HeaderStyle>
  );
}

export default ScheduleHeader;