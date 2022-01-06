import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import DragBlock from './DragBlock';

import { toDateObj, dayClasses } from '../../controllers/getDays';
import { isTempId } from "../../controllers/misc";
import { formatQueryError, weekdays, statusInfo } from '../../assets/strings';

import { usePrefetch, } from "../../models/baseApi";
import { useDraftQuery, useUpdateDraftMutation, } from "../../models/draftApi";

// Component
function Day({ drafts, isEditing, setDraftModal, day }) {
  // Definitions (memoize?)
  const { titleCls, borderCls } = dayClasses(day);
  const date = toDateObj(day);
  const canDrop = useCallback(types => types.includes("json/draftday"), []);

  // Global state
  const { data, isLoading, error } = useDraftQuery();
  const [ updateDraft ] = useUpdateDraftMutation();
  const prefetchDraft = usePrefetch('draft');
  const prefetchMatch = usePrefetch('match');
  const prefetchStats = usePrefetch('breakers');
  const loadDraft = id => { prefetchDraft(id); prefetchMatch(id); prefetchStats(id); };
  
  // Actions
  const dropHandler = (a,b) => {
    [a.day, b.day] = [b.day, a.day].map(d => d === 'none' ? null : d);
    updateDraft(a);
    if (b.id) updateDraft(b);
  }
  const editDraft = draftId => () => setDraftModal(draftId);

  return pug`
    DragBlock.p-2.m-1.rounded-md.w-40.min-h-32.border-opacity-100(
      storeData=({ id: null, day })
      onDrop=dropHandler
      unavailableCls=borderCls
      draggable=false
      dataType="json/draftday"
      canDrop=canDrop
      isAvailable=isEditing
    )
      h4.text-2xl.font-light.text-center.pointer-events-none(
        className=titleCls
      )= date ? weekdays[date.getDay()] : 'Unscheduled'

      h5.text-center.italic.text-sm.font-thin.mb-2.pointer-events-none= date ? date.toLocaleDateString() : ''

      if isLoading
        .text-center.text-sm.font-light.dim-color.italic.pointer-events-none.opacity-60 ...
      
      else if error
        .text-center.text-sm.font-light.dim-color.italic.pointer-events-none.opacity-60= formatQueryError(error)

      else if drafts && drafts.length
        each draftId in drafts
          if data && data[draftId] && !isTempId(draftId)
            DragBlock.relative.p-1.m-1.rounded-xl.text-center(
              storeData=({ id: draftId, day })
              onDrop=dropHandler
              isAvailable=isEditing
              dataType="json/draftday"
              canDrop=canDrop
              key=draftId
              onHover=(()=>loadDraft(draftId))
            )
              if isEditing
                .text-sm.font-normal.pointer-events-none(
                  className=(data[draftId].isDone ? "dim-color" : "link-color")
                )= data[draftId].title
                
                if data[draftId].status < 3
                  .absolute.top-0.right-1.text-sm.font-normal.cursor-pointer(
                    className="hover:"+(statusInfo[data[draftId].status].class)
                    onClick=editDraft(draftId)
                  ) ✐
              
              else
                Link.text-sm.font-normal.block(
                  to="/draft/"+draftId
                  className=(data[draftId].status === 1 ? "" : statusInfo[data[draftId].status + 1].class)
                )= data[draftId].title

          else
            .text-sm.font-thin.text-center.dim-color.pointer-events-none(key=draftId) ...
                
      else if !isEditing
        .text-center.text-sm.font-light.dim-color.italic.pointer-events-none.opacity-60 No drafts
  `;
}

Day.propTypes = {
  drafts: PropTypes.arrayOf(PropTypes.string),
  isEditing: PropTypes.bool,
  setDraftModal: PropTypes.func,
  day: PropTypes.string,
};

export default Day;