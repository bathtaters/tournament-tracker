import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import RawData from "./RawData";

import { usePlayerDraftsQuery } from "../../models/playerApi";
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
  { title: 'Draft', value: d => d.title, span: 3, link: d => `/draft/${d.id}` },
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

// Main component
function PlayerDrafts({ id }) {
  const { data, isLoading, error } = usePlayerDraftsQuery(id);

  // Setup pre-fetching
  const prefetchDraft = usePrefetch('draft');
  const prefetchMatch = usePrefetch('match');
  const prefetchStats = usePrefetch('breakers');
  const loadDraft = id => { prefetchDraft(id); prefetchMatch(id); prefetchStats(id); };

  const draftRow = draft => scheduleRows.map(row => 
    !row.hideBelow || row.hideBelow <= draft.status ?
      <h4
        className={'font-thin base-color ' + (row.span ? ' col-span-'+row.span : '')}
        key={draft.id+'_'+row.title}
      >
        { row.link ?
          <Link
            className={row.class ? row.class(draft): ''}
            onMouseEnter={()=>loadDraft(draft.id)}
            to={row.link(draft)}
          >
            {row.value(draft)}
          </Link>
        :
          <span className={row.class ? row.class(draft): ''}>{row.value(draft)}</span>
        }
      </h4>
    : 
    <div className={row.span ? 'col-span-'+row.span : ''} key={draft.id+'_'+row.title} />
  );

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
            data && data.length ? data.map(draftRow) : 
            <div className={"dim-color italic font-thin text-center my-2 "+scheduleGridClass.replace('grid-cols','col-span')}>– None –</div> 
          }
        </div>
      }
      
      <RawData className="mt-6" data={data} />
    </div>
  );
}

PlayerDrafts.propTypes = { id: PropTypes.string };

export default PlayerDrafts;