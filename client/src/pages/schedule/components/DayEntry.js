import React from "react";
import PropTypes from 'prop-types';

import DragBlock from '../../common/DragBlock';
import {
  EntryTitleStyle, EntryLinkStyle, EditEventButton,
  MissingDataStyle, dragAndDropClass
} from "../styles/DayStyles";

import { usePrefetch } from "../schedule.fetch";
import { isTempId } from '../services/date.services';
import { canDrop, dataType } from "../services/day.services";


function DayEntry({ day, id, data, isEditing, dropHandler, editEvent }) {
  // Setup prefetching
  const prefetchEvent = usePrefetch('event');
  const prefetchMatch = usePrefetch('match');
  const prefetchStats = usePrefetch('stats');
  const loadEvent = id => { prefetchEvent(id); prefetchMatch(id); prefetchStats(id); };

  if (!data || isTempId(id)) return <MissingDataStyle>...</MissingDataStyle>

  return (
    <DragBlock
      storeData={{ id, day }}
      onDrop={dropHandler}
      canDrop={canDrop}
      className={dragAndDropClass.inner}
      dataType={dataType}
      disabled={!isEditing}
      onHover={()=>loadEvent(id)}
    >
      { isEditing ? <>
        <EntryTitleStyle isDone={data.isDone}>{data.title}</EntryTitleStyle>
        
        { data.status < 3 && <EditEventButton status={data.status} onClick={editEvent} /> }

      </> :
        <EntryLinkStyle to={'/event/'+id} status={data.status}>{data.title}</EntryLinkStyle>
      }
    </DragBlock>
  );
}


DayEntry.propTypes = {
  day: PropTypes.string,
  data: PropTypes.object,
  isEditing: PropTypes.bool,
  canDrop: PropTypes.func,
  dropHandler: PropTypes.func,
  editEvent: PropTypes.func,
};

export default DayEntry;