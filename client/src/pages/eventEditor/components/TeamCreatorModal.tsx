import type { Player, Team } from "types/models";
import { type Dispatch, type SetStateAction, useCallback } from "react";
import PlayerEditor from "./PlayerEditor";
import InputForm from "../../../common/InputForm/InputForm";
import RawData from "../../../common/RawData/RawData";
import { TitleStyle } from "../styles/EventEditorStyles";
import {
  type ModalBackend,
  TeamCreatorModalStyle,
} from "../styles/TeamEditorStyles";
import { editorButtonLayout, teamEditorLayout } from "../eventEditor.layout";
import { getBaseData } from "../../../core/services/validation.services";

const teamBase = getBaseData("team");

type TeamCreatorProps = {
  team: Partial<Team>;
  updateTeam: Dispatch<SetStateAction<Partial<Team>>>;
  ignorePlayers?: Player["id"][];
  handleSubmit: (team: Partial<Team>) => void;
  handleDelete: (id: Team["id"]) => void;
  onFirstChange: () => void;
  backend: ModalBackend;
};

export default function TeamCreatorModal({
  team,
  updateTeam,
  ignorePlayers,
  handleSubmit,
  handleDelete,
  onFirstChange,
  backend,
}: TeamCreatorProps) {
  // Only updates 'name' from form
  const updateForm = useCallback(
    ({ name }: Partial<Team>) => updateTeam((team) => ({ ...team, name })),
    [updateTeam],
  );

  const updateList = useCallback(
    (players: Team["players"]) => updateTeam((team) => ({ ...team, players })),
    [updateTeam],
  );

  const buttons = editorButtonLayout(
    team.id,
    () => handleDelete(team.id),
    () => backend.close(),
  );

  return (
    <TeamCreatorModalStyle backend={backend}>
      <TitleStyle title={team?.id ? "Edit Team" : "Create Team"} />

      <InputForm
        rows={teamEditorLayout}
        data={team}
        baseData={teamBase}
        onSubmit={handleSubmit}
        onEdit={onFirstChange}
        onChange={updateForm}
        buttons={buttons}
      >
        <PlayerEditor
          type="Member"
          value={team.players}
          ignoreList={ignorePlayers}
          onChange={updateList}
          onFirstChange={onFirstChange}
          className="pt-4"
        />
      </InputForm>

      <RawData className="text-sm mt-4" data={team} />
    </TeamCreatorModalStyle>
  );
}
