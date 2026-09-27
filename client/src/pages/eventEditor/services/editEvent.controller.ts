import type { EventData } from "types/models";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useDeleteEventMutation,
  useEventQuery,
  useSetEventMutation,
  useTeamQuery,
} from "../eventEditor.fetch";
import { getChanged } from "../../../common/General/services/basic.services";
import {
  useLockScreen,
  useOpenAlert,
} from "../../../common/General/common.hooks";
import { deleteEventAlert } from "../../../assets/alerts";
import { editEventLockCaptions } from "../../../assets/constants";
import { editorButtonLayout } from "../eventEditor.layout";
import useTeamEditorController from "./teamEditor.controller";
import { getTeamPlayers, recommendedRoundCount } from "./listEditor.utils";

export default function useEditEventController(
  eventid: EventData["id"],
  closeModal: (overrideLock?: boolean) => void,
  hidePlayers = false,
  deleteRedirect?: string,
) {
  // Init server fetches
  const { data, isLoading, error } = useEventQuery(eventid, { skip: !eventid });
  const {
    data: teams,
    isLoading: teamLoad,
    error: teamErr,
  } = useTeamQuery(null);
  const [setEvent, { isLoading: eventUpdating }] = useSetEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  // Init hooks and local state
  let navigate = useNavigate();
  const openAlert = useOpenAlert();

  const [playerList, updatePlayerList] = useState(
    data?.team ? [] : data?.players || [],
  );
  const [teamList, updateTeamList] = useState(
    data?.team ? data?.players || [] : [],
  );
  const [isTeam, setIsTeam] = useState(!!data?.team);
  const [formValues, setFormValues] = useState<Partial<EventData>>({});
  const handleChange = useCallback((update: Partial<EventData>) => {
    if ("team" in update) setIsTeam(!!update.team);
    setFormValues(update);
  }, []);

  // Team Modal controller
  const {
    selectedTeam,
    updateSelectedTeam,
    saveTeam,
    removeTeam,
    autoGenerateTeams,
    teamUpdating,
    openTeamModal,
    teamModal,
  } = useTeamEditorController(teamList, updateTeamList, openAlert);
  useLockScreen(
    eventUpdating || teamUpdating,
    editEventLockCaptions[+Boolean(eventid)],
  );

  // Create/Update event and handle modal
  const submitHandler = useCallback(
    async (event: Partial<EventData>) => {
      // Build event object
      const players = event.team ? teamList : playerList;
      if (!event.title.trim() && !players.length) return closeModal(true);
      if (!hidePlayers) event.players = players;

      // Simplify update data
      if (eventid) {
        event = getChanged(data, event);
        if (!Object.keys(event).length) return closeModal(true);
        event.id = eventid;
      }

      // Push event to server (Create/Update)
      return setEvent(event).then(() => closeModal(true));
    },
    [data, setEvent, eventid, playerList, teamList, hidePlayers, closeModal],
  );

  // Break early if no data/error
  if (isLoading || teamLoad || error || teamErr || !closeModal)
    return {
      isLoading: isLoading || teamLoad,
      error: error || teamErr,
      notLoaded: true,
    };

  // Delete handler (for editorButtons)
  const deleteHandler = () =>
    openAlert(deleteEventAlert(data?.title), 0).then((res) => {
      if (!res) return;
      if (eventid) deleteEvent(eventid);
      closeModal(true);
      navigate(deleteRedirect);
    });

  // Recompute recommended rounds reactively from form + list state
  const format = formValues.format ?? data?.format;
  const team = "team" in formValues ? formValues.team : data?.team;
  const playerspermatch =
    formValues.playerspermatch ?? data?.playerspermatch ?? 2;
  const competitorCount = team
    ? teamList.length
    : hidePlayers
      ? ((formValues as any).playercount ?? (data as any)?.playercount)
      : playerList.length;
  const recommendedRounds = recommendedRoundCount(
    format,
    competitorCount,
    playerspermatch,
  );

  return {
    data,
    teams,
    playerList,
    updatePlayerList,
    teamList,
    saveTeam,
    removeTeam,
    selectedTeam,
    updateSelectedTeam,
    ignorePlayers: isTeam
      ? getTeamPlayers(
          teamList.filter((id) => id !== selectedTeam?.id),
          teams,
        )
      : undefined,
    handleChange,
    submitHandler,
    openTeamModal,
    teamModal,
    buttons: editorButtonLayout(eventid, deleteHandler, () => closeModal()),
    isTeam,
    recommendedRounds,
    autoGenerateTeams,
    defaultTeamSize: 2,
    isLoading,
    notLoaded: false,
  };
}
