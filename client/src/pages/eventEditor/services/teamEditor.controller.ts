import type { Team } from "types/models";
import type { OpenAlertFunction } from "types/base";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from "react";
import { nextTempId } from "../../../common/General/services/basic.services";
import { useModal } from "../../../common/Modal/Modal";
import {
  useDeleteTeamMutation,
  useSetTeamMutation,
} from "../eventEditor.fetch";
import { deleteTeamAlert } from "../../../assets/alerts";
import { chunkArray, randomArray } from "./listEditor.utils";

export default function useTeamEditorController(
  teamList: Team["players"],
  updateTeamList: Dispatch<SetStateAction<Team["players"]>>,
  openAlert: OpenAlertFunction,
) {
  // Init server fetches
  const [setTeam, { isLoading: teamUpdating }] = useSetTeamMutation();
  const [deleteTeam] = useDeleteTeamMutation();

  // Init hooks
  const { open, close, lock, backend } = useModal();
  const [selectedTeam, updateSelectedTeam] = useState<Partial<Team>>({});

  const openTeamModal = useCallback(
    (team?: Partial<Team>) => () => {
      updateSelectedTeam(team ?? { players: [] });
      open();
    },
    [open],
  );

  // Create a team
  const pushTeam = (team: Partial<Team>, tempId?: string) => {
    if (tempId) updateTeamList((teams) => teams.concat(tempId));
    setTeam(tempId ? { ...team, _tempId: tempId } : team)
      .then(({ data }) => {
        if (tempId && data?.id)
          updateTeamList((teams) =>
            teams.filter((id) => id !== tempId).concat(data.id),
          );
      })
      .catch(() => {
        if (tempId)
          updateTeamList((teams) => teams.filter((id) => id !== tempId));
      });
  };

  // Create/Update/Delete teams
  const saveTeam = (team: Partial<Team>) => {
    if (!selectedTeam.players.length) return close(true);
    pushTeam(selectedTeam, team.id ? undefined : nextTempId("team", teamList));
    close(true);
  };

  // Shuffle the active player pool into teams of `size` and create each.
  const autoGenerateTeams = (size: number, playerIds: Team["players"]) => {
    if (!playerIds?.length) return;
    const groups = chunkArray(randomArray(playerIds), size);
    const accumulating = [...teamList];
    groups.forEach((players) => {
      const tempId = nextTempId("team", accumulating);
      accumulating.push(tempId);
      pushTeam({ players }, tempId);
    });
  };

  const removeTeam = useCallback(
    (teamId: Team["id"]) => {
      openAlert(deleteTeamAlert, 0).then((res) => {
        if (!res) return;
        // Optimistic update
        updateTeamList((teams) => teams.filter((id) => id !== teamId));
        // API call
        deleteTeam(teamId).catch(() =>
          // Rollback
          updateTeamList((teams) => teams.concat(teamId)),
        );
        close(true);
      });
    },
    [openAlert, deleteTeam, updateTeamList, close],
  );

  return {
    selectedTeam,
    updateSelectedTeam,
    saveTeam,
    removeTeam,
    autoGenerateTeams,
    teamUpdating,
    openTeamModal,
    teamModal: { lock, backend },
  };
}
