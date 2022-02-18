import React, { useRef } from "react";
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";

import PlayerEditor from "./components/PlayerEditor";
import { EventTitleStyle, EventStatusStyle } from "./styles/EventEditorStyles";

import InputForm from "../common/InputForm";
import RawData from "../common/RawData";
import Loading from "../common/Loading";

import { 
  useEventQuery, useCreateEventMutation,
  useDeleteEventMutation, useUpdateEventMutation
} from "./eventEditor.fetch";
import { saveEvent } from "./services/eventEditor.services";
import { editorLayout, editorButtonLayout } from "./eventEditor.layout";

import { deleteEventMsg } from "../../assets/strings";
import valid from "../../assets/validation.json";


function EditEvent({ eventid, modal }) {
  // Init state
  const playerList = useRef(null);
  const { data, isLoading, error } = useEventQuery(eventid, { skip: !eventid });
  const eventStatus = data ? data.status : 0;
  
  // Init mutators
  let navigate = useNavigate();
  const [ deleteEvent ] = useDeleteEventMutation();
  const [ createEvent ] = useCreateEventMutation();
  const [ updateEvent ] = useUpdateEventMutation();

  // Loading/Error catcher
  if (isLoading || error || !modal)
    return (<Loading loading={isLoading} error={error} altMsg="Error loading popup" tagName="h3" />)

  // Actions
  const clickDelete = () => {
    if (!window.confirm(deleteEventMsg(data && data.title))) return;
    if (eventid) deleteEvent(eventid);
    modal.current.close(true);
    navigate("/home");
  };
  const submitHandler = (eventData) =>
    saveEvent(eventid, eventData, playerList.current.getList(), createEvent, updateEvent)
      && modal.current.close(true);

  // Button layout
  const buttons = editorButtonLayout(eventid, clickDelete, modal.current.close);

  // Render
  return (
    <div>
      <EventTitleStyle isNew={!data} />
      { Boolean(eventStatus) && <EventStatusStyle status={eventStatus} /> }

      <InputForm
        rows={editorLayout}
        data={data}
        baseData={{defaultValues: valid.defaults.event, limits: valid.limits.event, eventStatus}}
        onSubmit={submitHandler}
        onEdit={modal.current.lock}
        buttons={buttons}
        rowFirst={true}
      >
        <PlayerEditor 
          players={data && data.players}
          status={eventStatus}
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