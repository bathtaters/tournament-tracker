import React, { useRef } from "react";
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";

import PlayerEditor from "./components/PlayerEditor";
import { TitleStyle, StatusStyle } from "./styles/EventEditorStyles";

import InputForm from "../common/InputForm";
import RawData from "../common/RawData";
import Loading from "../common/Loading";

import { editorLayout } from "./eventEditor.layout";
import { saveEvent, getButtonLayout } from "./services/eventEditor.services";
import { useEventQuery, useCreateEventMutation, useDeleteEventMutation, useUpdateEventMutation } from "./eventEditor.fetch";

import valid from "../../assets/validation.json";
const baseData = { defaultValues: valid.defaults.event, limits: valid.limits.event };

function EditEvent({ eventid, modal }) {
  // Init state
  const playerList = useRef(null);
  const { data, isLoading, error } = useEventQuery(eventid, { skip: !eventid });
  
  // Init mutators
  let navigate = useNavigate();
  const [ deleteEvent ] = useDeleteEventMutation();
  const [ createEvent ] = useCreateEventMutation();
  const [ updateEvent ] = useUpdateEventMutation();

  // Loading/Error catcher
  if (isLoading || error || !modal) return <Loading loading={isLoading} error={error} altMsg="Popup not initialized" tagName="h3" />;

  // Actions
  const submitHandler = (event) => saveEvent(eventid, event, playerList, createEvent, updateEvent, modal);

  // Button layout
  const buttons = getButtonLayout(eventid, data, deleteEvent, modal, navigate);

  // Render
  return (
    <div>
      <TitleStyle isNew={!data} />
      { Boolean(data?.status) && <StatusStyle status={data.status} /> }

      <InputForm
        rows={editorLayout}
        data={data}
        baseData={{ ...baseData, eventStatus: data?.status || 0 }}
        onSubmit={submitHandler}
        onEdit={modal.current.lock}
        buttons={buttons}
        rowFirst={true}
      >
        <PlayerEditor 
          players={data?.players}
          status={data?.status || 0}
          onEdit={modal.current.lock}
          ref={playerList}
        />
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