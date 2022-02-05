import React, { useRef } from "react";
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";

import PlayerEditor from "./components/PlayerEditor";
import InputForm from "../shared/InputForm";
import RawData from "../shared/RawData";

import { 
  useEventQuery, useCreateEventMutation,
  useDeleteEventMutation, useUpdateEventMutation
} from "./eventEditor.fetch";

import { formatQueryError, statusInfo, deleteEventMsg } from "../../assets/strings";

import { limits, defaultValues } from "../event/services/event.services";


// Settings Window Layout/Validation
const lockAt = (statusVal = defaultValues.lockat) => (_,base) => base.eventStatus != null && base.eventStatus >= statusVal;

const settingsRows = [ 'custom', [
  {
    label: 'Title', id: 'title', type: 'text',
    className: "text-base sm:text-xl font-medium m-2",
    transform: (title,data) => title.trim() ? title.trim() : (data && data.title) || defaultValues.title
  },{ 
    label: 'Total Rounds', id: 'roundcount',
    type: 'number', disabled: lockAt(3),
    min: data => data ? data.roundactive : limits.roundcount.min
  },{
    label: 'Wins Needed', id: 'wincount',
    type: 'number', disabled: lockAt(),
  },{
    label: 'Players per Game', id: 'playerspermatch',
    type: 'number', disabled: lockAt(),
  },
]];


// Component
function EditEvent({ eventid, hideModal, lockModal }) {
  // Init state
  const playerList = useRef(null);
  const { data, isLoading, error } = useEventQuery(eventid, { skip: !eventid });
  const eventStatus = data ? data.status : 0;
  
  // Delete (& navigate to home page)
  let navigate = useNavigate();
  const [ deleteEvent ] = useDeleteEventMutation();
  const clickDelete = () => {
    if (!window.confirm(deleteEventMsg(data && data.title))) return;
    if (eventid) deleteEvent(eventid);
    hideModal(true);
    navigate("/home");
  };
  
  // Submit event
  const [ createEvent ] = useCreateEventMutation();
  const [ updateEvent ] = useUpdateEventMutation();
  const submitEvent = eventData => {
    // Retrieve list from component
    const savedPlayers = playerList.current.getList();
    if (!savedPlayers) return;
    
    // Build event object
    if (!eventData.title.trim() && !savedPlayers.length) return hideModal(true);
    if (eventid) eventData.id = eventid;
    eventData.players = savedPlayers;

    // Add to DB
    if (!eventid) createEvent(eventData);
    else updateEvent(eventData);
    hideModal(true);
  };


  // Render

  if (isLoading)
    return (<div><h3 className="font-light max-color text-center">Loading...</h3></div>);
  
  else if (error)
    return (<div>
      <h3 className="font-light max-color text-center">{formatQueryError(error)}</h3>
    </div>);

  // Button info - TO MEMOIZE
  const buttons =  eventid ? [
    {
      label: "Delete", onClick: clickDelete,
      className: "font-normal base-color-inv neg-bgd w-14 h-8 mx-1 sm:w-20 sm:h-11 sm:mx-4 opacity-80"
    },
    { label: "Cancel", onClick: hideModal }
  ] : [{ label: "Cancel", onClick: hideModal }];

  return (
    <div>
      <h3 className="font-light max-color text-center mb-2">{data ? 'Edit Event' : 'New Event'}</h3>
      { eventStatus ?
        <h5 className="text-center mb-2">
          <span className="mr-1">Status:</span>
          <span className={"font-thin "+statusInfo[eventStatus].class}>{statusInfo[eventStatus].label}</span>
        </h5>
      : null }
      <InputForm
        rows={settingsRows}
        data={data}
        baseData={{defaultValues, limits, eventStatus}}
        onSubmit={submitEvent}
        onEdit={lockModal}
        buttons={buttons}
        rowFirst={true}
      >
        <PlayerEditor 
          players={data && data.players}
          status={eventStatus}
          onEdit={lockModal}
          ref={playerList}
        />
      </InputForm>
      <RawData className="text-sm mt-4" data={data} />
    </div>
  );
}

EditEvent.propTypes = {
  eventid: PropTypes.string,
  hideModal: PropTypes.func,
  lockModal: PropTypes.func,
};

export default EditEvent;