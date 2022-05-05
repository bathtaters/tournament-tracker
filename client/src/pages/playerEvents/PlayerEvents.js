import React from "react"
import PropTypes from "prop-types"

import DataTable from "../common/DataTable"
import Loading from "../common/Loading"
import RawData from "../common/RawData"
import { WrapperStyle, HeaderStyle, tableHdrStyle } from "./styles/PlayerEventStyles"

import eventsLayout from "./playerEvents.layout"
import { useEventQuery, usePlayerEventsQuery, usePlayerMatchesQuery, usePrefetchEvent } from "./playerEvents.fetch"


function PlayerEvents({ id }) {
  // Fetch global state
  const { data: eventIds, isLoading, error } = usePlayerEventsQuery(id)
  const { data: matches, isLoading: matchLoad, error: matchErr } = usePlayerMatchesQuery(id)
  const { data: events,  isLoading: eventLoad, error: eventErr } = useEventQuery()

  // Setup pre-fetching
  const prefetch = usePrefetchEvent()

  // Handle loading/errors
  const [ loading, err ] = [ isLoading || matchLoad || eventLoad,  error || matchErr || eventErr ];
  if (loading || err || !events || !Array.isArray(eventIds)) return (
    <WrapperStyle title="Schedule">
      <DataTable colLayout={eventsLayout} className="mx-4" hdrClass={tableHdrStyle}>
        <Loading loading={loading} error={err} altMsg="Not found" />
      </DataTable>
    </WrapperStyle>
  )

  // Render
  return (
    <WrapperStyle>
      <HeaderStyle>Schedule</HeaderStyle>

      <DataTable
        colLayout={eventsLayout}
        rowIds={eventIds}
        extra={{ events, matches }}
        rowLink="event/"
        className="mx-4"
        cellClass="py-1"
        hdrClass={tableHdrStyle}
        onRowHover={prefetch}
      >
        – None –
      </DataTable>
      
      <RawData className="mt-6" data={eventIds} />
    </WrapperStyle>
  );
}

PlayerEvents.propTypes = { id: PropTypes.string }

export default PlayerEvents