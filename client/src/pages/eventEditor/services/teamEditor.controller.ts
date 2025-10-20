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

  // Create/Update/Delete teams
  const saveTeam = (team: Partial<Team>) => {
    if (!selectedTeam.players.length) return close(true);

    let tempId: string | undefined;
    if (!team.id) {
      // Optimistic update
      tempId = nextTempId("team", teamList);
      updateTeamList((teams) => teams.concat(tempId));
    }

    // API call
    setTeam(selectedTeam)
      .then(({ data }) => {
        // Replace tempID with response
        if (tempId && data?.id)
          updateTeamList((teams) =>
            teams.filter((id) => id !== tempId).concat(data.id),
          );
      })
      .catch(() => {
        // Rollback
        if (tempId)
          updateTeamList((teams) => teams.filter((id) => id !== tempId));
      });
    close(true);
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
    teamUpdating,
    openTeamModal,
    teamModal: { lock, backend },
  };
}
