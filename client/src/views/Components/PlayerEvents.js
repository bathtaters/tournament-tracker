import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import RawData from "./RawData";

import { usePlayerEventsQuery } from "../../models/playerApi";
import { useEventQuery } from "../../models/eventApi";
import { usePrefetch, } from "../../models/baseApi";

import { formatQueryError, statusInfo } from "../../assets/strings";
import { dayClasses } from "../../controllers/getDays";

// Component layout
const scheduleRows = [
  { 
    title: 'Day', 
    value: ({day}) => day ? day.slice(5,10).replace(/-/g,'/') : 'None', 
    class: ({day}) => dayClasses(day && day.slice(0,10)).titleCls,
  },
  { title: 'Event', value: d => d.title, span: 3, link: d => `/event/${d.id}` },
  {
    title: 'Status', span: 2,
    value: ({isdrop, status}) => statusInfo[status || 0].label + (isdrop ? " (Dropped)" : ""),
    class: ({status}) => statusInfo[status || 0].class,
  },
  { title: 'Wins', value: ({wins}) => wins, hideBelow: 2 },
  { title: 'Losses', value: d => d.count - d.wins - d.draws, hideBelow: 2 },
  { title: 'Draws', value: ({draws}) => draws, hideBelow: 2 },
]
const scheduleGridClass = `grid-cols-${scheduleRows.reduce((c,r) => c + (r.span || 1),0)}`;
const scheduleGridSpan = scheduleGridClass.replace('grid-cols','col-span')

// Main component
function PlayerEvents({ id }) {
  const { data, isLoading, error } = usePlayerEventsQuery(id);

  return (
    <div className="my-4">
      <h3 className="dim-color mt-4 font-thin">Schedule</h3>
      { isLoading ?
        <h4 className="base-color font-thin">Loading...</h4>

      : error || !Array.isArray(data) ?
        <h4 className="base-color font-thin italic">{error ? formatQueryError(error) : 'Not found'}</h4>

      :
        <div className={'grid grid-flow-row gap-x-2 gap-y-1 mx-4 ' + (scheduleGridClass)}>
          { scheduleRows.map(row => 
            <h4 className={row.span ? 'col-span-'+row.span : ''} key={'HDR_'+row.title}>
              {row.title}
            </h4>
          ) }

          { 
            data && data.length ? data.map(eventId => <EventRow eventId={eventId}/>) : 
            <div className={"dim-color italic font-thin text-center my-2 "+scheduleGridSpan}>– None –</div> 
          }
        </div>
      }
      
      <RawData className="mt-6" data={data} />
    </div>
  );
}

// Row w/ event info

function EventRow({ eventId }) {
  const { data, isLoading, error } = useEventQuery(eventId);

  // Setup pre-fetching
  const prefetchMatch = usePrefetch('match');
  const prefetchStats = usePrefetch('stats');
  const loadEvent = id => { prefetchMatch(id); prefetchStats(id); };

  if (isLoading) return (<div className={"dim-color font-thin text-center "+scheduleGridSpan}>...</div>);

  if (error || !data)
    return (<div className={"dim-color font-thin italic "+scheduleGridSpan}>{
      error ? formatQueryError(error) : 'Not found'
    }</div>);

  return scheduleRows.map(row => 
    !row.hideBelow || row.hideBelow <= data.status ?
      <h4
        className={'font-thin base-color ' + (row.span ? ' col-span-'+row.span : '')}
        key={eventId+'_'+row.title}
      >
        { row.link ?
          <Link
            className={row.class ? row.class(data): ''}
            onMouseEnter={()=>loadEvent(eventId)}
            to={row.link(data)}
          >
            {row.value(data)}
          </Link>
        :
          <span className={row.class ? row.class(data): ''}>{row.value(data)}</span>
        }
      </h4>
    : 
    <div className={row.span ? 'col-span-'+row.span : ''} key={eventId+'_'+row.title} />
  );
}


PlayerEvents.propTypes = { id: PropTypes.string };
EventRow.propTypes = { eventId: PropTypes.string };

export default PlayerEvents;