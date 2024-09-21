import React, { useRef } from "react";
import Modal from "../common/Modal";
import RawData from "../common/RawData";

import EventHeader from "./components/EventHeader";
import EventDashboard from "./components/EventDashboard";
import EditEvent from "../eventEditor/EditEvent";
import Round from "./components/Round";
import Loading from "../common/Loading";
import CreditButtons from "./components/subcomponents/CreditButtons";
import { TitleStyle, DashboardStyle } from "./styles/DashboardStyles";

import { useEventClock, useEventQuery, useSettingsQuery } from "./event.fetch";
import { roundArray } from "./services/event.services";
import { isFinished, useDeleteRound } from "./services/roundButton.services";
import { useParamIds } from "../common/services/idUrl.services";
import EventClock from "./components/EventClock";


function Event() {
  // Get data
  const modal = useRef(null);
  const { id } = useParamIds('id');
  const { data, isLoading, error, isFetching } = useEventQuery(id);
  const { data: clock, error: clockErr } = useEventClock(id, data?.status)
  const { data: settings, isLoading: sLoad, error: sErr } = useSettingsQuery();

  // Handle delete round
  const handleDelete = useDeleteRound(data);
  
  // Loading/Error catcher
  if (isLoading || error || sLoad || sErr || clockErr || !data)
    return <Loading loading={isLoading || sLoad} error={error || sErr || clockErr} altMsg="Event not found" tagName="h3" />;

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
      
      { settings.showcredits && isFinished(data) && <CreditButtons id={id} /> }

      { clock && data?.status === 2 && <EventClock {...clock} /> }

      <RawData data={{ ...data, clock }} />

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