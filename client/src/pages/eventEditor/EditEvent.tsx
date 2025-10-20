import PlayerEditor from "./components/PlayerEditor";
import TeamEditor from "./components/TeamEditor";
import InputForm from "common/InputForm/InputForm";
import RawData from "common/RawData/RawData";
import Loading from "common/Loading/Loading";
import { StatusStyle, TitleStyle } from "./styles/EventEditorStyles";
import useEditEventController from "./services/editEvent.controller";
import { editorLayout } from "./eventEditor.layout";

import { getBaseData } from "core/services/validation.services";
import TeamCreatorModal from "./components/TeamCreatorModal";

const baseData = getBaseData("event");

type EditEventProps = {
  eventid?: string;
  lockModal: () => void;
  closeModal: (refresh?: boolean) => void;
  hidePlayers?: boolean;
  onDeleteRedirect?: string;
  modal?: object;
};

function EditEvent({
  eventid,
  lockModal,
  closeModal,
  hidePlayers,
  onDeleteRedirect = "/home",
}: EditEventProps) {
  const {
    data,
    teams,
    playerList,
    updatePlayerList,
    teamList,
    saveTeam,
    removeTeam,
    selectedTeam,
    updateSelectedTeam,
    ignorePlayers,
    buttons,
    handleChange,
    submitHandler,
    openTeamModal,
    teamModal,
    isTeam,
    isLoading,
    error,
    notLoaded,
  } = useEditEventController(
    eventid,
    closeModal,
    hidePlayers,
    onDeleteRedirect,
  );

  // Loading/Error catcher
  if (notLoaded)
    return (
      <Loading
        loading={isLoading}
        error={error}
        altMsg="Modal error"
        tagName="h3"
      />
    );

  return (
    <div>
      <TitleStyle title={data ? "Edit Event" : "New Event"} />
      {Boolean(data?.status) && <StatusStyle status={data.status} />}

      <InputForm
        rows={editorLayout(hidePlayers)}
        data={data}
        baseData={baseData}
        onSubmit={submitHandler}
        onEdit={lockModal}
        onChange={handleChange}
        buttons={buttons}
        rowFirst={true}
      >
        {hidePlayers ? null : isTeam ? (
          <TeamEditor
            value={teamList}
            teams={teams}
            isStarted={data?.status && data?.status > 1}
            openEditor={openTeamModal}
          />
        ) : (
          <PlayerEditor
            value={playerList}
            onChange={updatePlayerList}
            isStarted={data?.status && data?.status > 1}
            onFirstChange={lockModal}
          />
        )}
      </InputForm>

      <RawData className="text-sm mt-4" data={data} />

      <TeamCreatorModal
        team={selectedTeam}
        updateTeam={updateSelectedTeam}
        ignorePlayers={ignorePlayers}
        handleSubmit={saveTeam}
        handleDelete={removeTeam}
        onFirstChange={teamModal.lock}
        backend={teamModal.backend}
      />
    </div>
  );
}

export default EditEvent;
