import PlayerEditor from "./components/PlayerEditor";
import InputForm from "common/InputForm/InputForm";
import RawData from "common/RawData/RawData";
import Loading from "common/Loading/Loading";
import { StatusStyle, TitleStyle } from "./styles/EventEditorStyles";
import useEditEventController from "./services/editEvent.controller";
import { editorLayout } from "./eventEditor.layout";

import { getBaseData } from "core/services/validation.services";

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
    playerList,
    updatePlayerList,
    buttons,
    submitHandler,
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
      <TitleStyle isNew={!data} />
      {Boolean(data?.status) && <StatusStyle status={data.status} />}

      <InputForm
        rows={editorLayout(hidePlayers)}
        data={data}
        baseData={baseData}
        onSubmit={submitHandler}
        onEdit={lockModal}
        buttons={buttons}
        rowFirst={true}
      >
        {!hidePlayers && (
          <PlayerEditor
            value={playerList}
            onChange={updatePlayerList}
            isStarted={data?.status && data?.status > 1}
            onFirstChange={lockModal}
          />
        )}
      </InputForm>

      <RawData className="text-sm mt-4" data={data} />
    </div>
  );
}

export default EditEvent;
