import React, { useRef } from "react";
import { useParams } from "react-router-dom";
import Modal from "../common/Modal";
import RawData from "../common/RawData";

import { TitleStyle, DashboardStyle } from "./styles/EventStyles";
import EditEvent from "../eventEditor/EditEvent";
import Round from "./components/Round";
import RoundButton from "./components/RoundButton";
import EventDashboard from "./components/EventDashboard";

import { useEventQuery, useClearRoundMutation } from "./event.fetch";
import { deleteRoundMsg, formatQueryError } from "../../assets/strings";


function Event() {
  // Local
  let { id } = useParams();
  const modal = useRef(null);

  // Global
  const { data, isLoading, error, isFetching } = useEventQuery(id);
  const [ prevRound ] = useClearRoundMutation();
  const handleDelete = () => {
    if (!window.confirm(deleteRoundMsg)) return;
    prevRound(id)
  }
  
  // Loading screen
  if (isLoading || error || !data)
    return <h3 className="italic text-center font-thin">{
      isLoading ? 'Loading...' :
      !error ? 'Event not found' :
      formatQueryError(error)
    }</h3>;
  
  // Build Round boxes
  let rounds = [];
  const matchCount = data.matches && data.matches.length;
  for (let roundNum = matchCount || 0; roundNum > 0; roundNum--) {
    rounds.push(
      <Round
        key={id+'.'+roundNum}
        data={data}
        round={roundNum - 1}
        deleteRound={roundNum === matchCount ? handleDelete : null}
      />
    );
  }

  // Render
  return (
    <div>
      <TitleStyle>{data.title}</TitleStyle>

      <RoundButton data={data} disabled={isFetching} />

      <DashboardStyle>
        <EventDashboard data={data} openStats={()=>modal.current.open()} />
        {rounds}
      </DashboardStyle>

      <RawData data={data} />

      <Modal ref={modal}>
        <EditEvent
          eventid={id}
          modal={modal}
        />
      </Modal>
    </div>
  );
}

export default Event;