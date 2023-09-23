import React from "react";
import PropTypes from 'prop-types';

import PlayerEditor from "./components/PlayerEditor";
import { TitleStyle, StatusStyle } from "./styles/EventEditorStyles";

import InputForm from "../common/InputForm";
import RawData from "../common/RawData";
import Loading from "../common/Loading";

import useEditEventController from "./services/editEvent.controller";
import { editorLayout } from "./eventEditor.layout";

import { getBaseData } from "../../core/services/validation.services";
const baseData = getBaseData('event');


function EditEvent({ eventid, modal, hidePlayers }) {
  
  const {
    data, playerList, updatePlayerList,
    buttons, submitHandler,
    isLoading, error, notLoaded
  } = useEditEventController(eventid, modal, hidePlayers)

  // Loading/Error catcher
  if (notLoaded) return <Loading loading={isLoading} error={error} altMsg="Modal error" tagName="h3" />

  return (
    <div>
      <TitleStyle isNew={!data} />
      { Boolean(data?.status) && <StatusStyle status={data.status} /> }

      <InputForm
        rows={editorLayout(hidePlayers)}
        data={data}
        baseData={{ ...baseData, eventStatus: data?.status || 0 }}
        onSubmit={submitHandler}
        onEdit={modal.current.lock}
        buttons={buttons}
        rowFirst={true}
      >
        {!hidePlayers && 
          <PlayerEditor 
            value={playerList}
            onChange={updatePlayerList}
            isStarted={data?.status && data?.status > 1}
            onFirstChange={modal.current.lock}
          />
        }
      </InputForm>

      <RawData className="text-sm mt-4" data={data} />
    </div>
  );
}

EditEvent.propTypes = {
  eventid: PropTypes.string,
  modal: PropTypes.object,
};

export default EditEvent;