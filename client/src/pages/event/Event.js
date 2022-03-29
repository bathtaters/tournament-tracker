import React, { useRef } from "react";
import { useParams } from "react-router-dom";
import Modal from "../common/Modal";
import RawData from "../common/RawData";

import EventHeader from "./components/subcomponents/EventHeader";
import EventDashboard from "./components/EventDashboard";
import EditEvent from "../eventEditor/EditEvent";
import Round from "./components/Round";
import Loading from "../common/Loading";
import { TitleStyle, DashboardStyle } from "./styles/DashboardStyles";

import { useEventQuery, useClearRoundMutation } from "./event.fetch";
import { roundArray } from "./services/event.services";
import { deleteRoundAlert } from "../../assets/alerts";
import { useOpenAlert } from "../common/common.hooks";

function Event() {
  // Local
  let { id } = useParams();
  const modal = useRef(null);

  // Global
  const { data, isLoading, error, isFetching } = useEventQuery(id);
  const [ prevRound ] = useClearRoundMutation();
  const openAlert = useOpenAlert();
  const handleDelete = () => openAlert(deleteRoundAlert,0).then(r => r && prevRound(id));
  
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
            key={id+'.'+roundNum}
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