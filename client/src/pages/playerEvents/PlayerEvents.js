import React from "react";
import PropTypes from "prop-types";

import EventRow from "./components/EventRow";
import Loading from "../common/Loading";
import RawData from "../common/RawData";
import { WrapperStyle, GridStyle } from "./styles/PlayerEventStyles";
import { HeaderStyle, NoEventsStyle } from "./styles/CellStyle";

import scheduleRows from "./playerEvents.layout";
import { useEventQuery, usePlayerEventsQuery, usePlayerMatchesQuery, usePrefetchEvent } from "./playerEvents.fetch";


function PlayerEvents({ id }) {
  // Fetch global state
  const { data, isLoading, error } = usePlayerEventsQuery(id);
  const { data: matches, isLoading: matchLoad, error: matchErr } = usePlayerMatchesQuery(id);
  const { data: events,  isLoading: eventLoad, error: eventErr } = useEventQuery();

  // Setup pre-fetching
  const prefetch = usePrefetchEvent();

  // Handle loading/errors
  const [ loading, err ] = [ isLoading || matchLoad || eventLoad,  error || matchErr || eventErr ];
  if (loading || err || !events || !Array.isArray(data)) return <Loading loading={loading} error={err} altMsg="Not found" />;

  // Render
  return (
    <WrapperStyle title="Schedule">
      <GridStyle>
        { scheduleRows.map(row => <HeaderStyle span={row.span} key={row.title}>{row.title}</HeaderStyle>) }

        { data.length ?
            data.map(eventId => <EventRow data={events[eventId]} results={matches[eventId]} prefetch={prefetch} key={eventId} />)
            :
            <NoEventsStyle />
        }
      </GridStyle>
      
      <RawData className="mt-6" data={data} />
    </WrapperStyle>
  );
}

PlayerEvents.propTypes = { id: PropTypes.string };

export default PlayerEvents;