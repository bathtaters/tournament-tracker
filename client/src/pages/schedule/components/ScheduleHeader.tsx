import {
  HeaderStyle,
  TitleStyle,
  HeaderButton,
} from "../styles/ScheduleStyles";
import { useAccessLevel } from "../../../common/General/common.fetch";

type ScheduleHeaderProps = {
  isEditing: boolean;
  setEdit: (isEditing: boolean) => void;
  openModal: () => void;
};

export default function ScheduleHeader({ isEditing, setEdit, openModal }: ScheduleHeaderProps) {
  const { access } = useAccessLevel();

  return (
    <HeaderStyle>
      {access > 1 && (
        <HeaderButton onClick={() => openModal()}>＋</HeaderButton>
      )}

      <TitleStyle>Schedule</TitleStyle>

      {access > 1 && (
        <HeaderButton onClick={() => setEdit(!isEditing)}>
          {isEditing ? "Back" : "Edit"}
        </HeaderButton>
      )}
    </HeaderStyle>
  );
}
