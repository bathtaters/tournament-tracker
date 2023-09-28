import React, { useRef } from "react";
import Modal from "../common/Modal";
import RawData from "../common/RawData";

import EventHeader from "./components/EventHeader";
import EventDashboard from "./components/EventDashboard";
import EditEvent from "../eventEditor/EditEvent";
import Round from "./components/Round";
import Loading from "../common/Loading";
import { TitleStyle, DashboardStyle } from "./styles/DashboardStyles";

import { useEventQuery } from "./event.fetch";
import { roundArray } from "./services/event.services";
import { useDeleteRound } from "./services/roundButton.services";
import { useParamIds } from "../common/services/idUrl.services";


function Event() {
  // Get data
  const modal = useRef(null);
  const { id } = useParamIds('id');
  const { data, isLoading, error, isFetching } = useEventQuery(id);

  // Handle delete round
  const handleDelete = useDeleteRound(data);
  
  // Loading/Error catcher
  if (isLoading || error || !data)
    return <Loading loading={isLoading} error={error} altMsg="Event not found" tagName="h3" />;

  // Render
  return (
    <div>
      <TitleStyle>{data.title}</TitleStyle>

      <EventHeader data={data} disabled={isFetching} />

      <DashboardStyle>
        <EventDashboard data={data} openStats={()=>modal.current.open()} />

        {roundArray(data.matches && data.matches.length).map((roundNum, idx) => 
          <Round
            key={`${id}.${roundNum}`}
            data={data}
            round={roundNum - 1}
            deleteRound={!idx ? handleDelete : null}
          />
        )}

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