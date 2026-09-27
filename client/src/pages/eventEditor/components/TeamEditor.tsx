import type { Team } from "types/models";
import type { EditableListProps } from "common/EditableList/EditableList";
import { useState } from "react";
import TeamListEntry from "./TeamListEntry";
import AutoGenTeam from "./AutoGenTeam";
import Loading from "../../../common/Loading/Loading";
import RawData from "../../../common/RawData/RawData";
import {
  AddTeamButton,
  TeamEditorContainer,
  TeamListWrapper,
} from "../styles/TeamEditorStyles";
import { usePlayerQuery } from "../../../common/General/common.fetch";

type TeamEditorProps = {
  value: Team["players"];
  teams?: Record<Team["id"], Team>;
  openEditor: (team?: Partial<Team>) => () => void;
  isStarted?: EditableListProps<Team>["isLocked"];
  onAutoGenerate?: (size: number, playerIds: Team["players"]) => void;
  defaultTeamSize?: number;
};

export default function TeamEditor({
  value,
  teams,
  isStarted,
  openEditor,
  onAutoGenerate,
  defaultTeamSize = 2,
}: TeamEditorProps) {
  const { data: players, isLoading, error } = usePlayerQuery(null);
  const [teamsize, setTeamsize] = useState(defaultTeamSize);

  if (isLoading || error || !teams || !players)
    return <Loading loading={isLoading} error={error} />;

  return (
    <TeamEditorContainer title="Teams" counter={value?.length}>
      <TeamListWrapper>
        {value.map((teamId) => (
          <TeamListEntry
            key={teamId}
            team={teams[teamId]}
            players={players}
            lock={isStarted}
            onClick={openEditor(teams[teamId])}
          />
        ))}
      </TeamListWrapper>

      {!isStarted && value.length === 0 && (
        <AutoGenTeam
          teamsize={teamsize}
          setTeamsize={setTeamsize}
          players={players}
          onAutoGenerate={onAutoGenerate}
        />
      )}

      {!isStarted && (
        <AddTeamButton onClick={openEditor()}>+ Create Team</AddTeamButton>
      )}
      <RawData className="text-sm mt-4" data={value.map((id) => teams[id])} />
    </TeamEditorContainer>
  );
}
