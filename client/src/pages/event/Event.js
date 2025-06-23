import RawData from "../common/RawData";

import EventHeader from "./components/EventHeader";
import EventDashboard from "./components/EventDashboard";
import EditEvent from "../eventEditor/EditEvent";
import EventClock from "./components/EventClock";
import Round from "./components/Round";
import { Modal, useModal } from "../common/Modal";
import Loading from "../common/Loading";
import CreditButtons from "./components/subcomponents/CreditButtons";
import { TitleStyle, DashboardStyle } from "./styles/DashboardStyles";

import { useEventQuery, useSettingsQuery } from "./event.fetch";
import { roundArray, useEventClock } from "./services/event.services";
import { isFinished, useDeleteRound } from "./services/roundButton.services";
import { useParamIds } from "../common/services/idUrl.services";
import { isZero } from "./services/clock.services";


function Event() {
  // Get data
  const { backend, open, close, lock } = useModal()
  const { id } = useParamIds('id');
  const { data, isLoading, error, isFetching } = useEventQuery(id);
  const { data: clock, error: clockErr } = useEventClock(id, data?.status, data?.clocklimit)
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
        <EventDashboard data={data} openStats={open} />

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

      { data?.status === 2 && !isZero(clock?.limit) && <EventClock {...clock} /> }

      <RawData data={{ ...data, clock }} />

      <Modal backend={backend}>
        <EditEvent
          eventid={id}
          lockModal={lock}
          closeModal={close}
        />
      </Modal>
    </div>
  );
}

export default Event;