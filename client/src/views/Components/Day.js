import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import DragBlock from './DragBlock';

import { toDate, toDateObj } from '../../controllers/getDays';
import { formatQueryError, weekdays, statusInfo } from '../../assets/strings';

import { useDraftQuery, useUpdateDraftMutation, } from "../../models/draftApi";

// Component class styles
const dayClasses = day => {
  const today = new Date();
  if (day === toDate(today)) return { titleCls: "max-color", borderCls: "pos-border" };
  return (day === 'none' || new Date(day) < today) ?
    { titleCls: "dim-color-inv", borderCls: "dimmer-border" } :
    { titleCls: "base-color",    borderCls: "base-border" };
}

// Component
function Day({ drafts, isEditing, setDraftModal, day }) {
  // Definitions (memoize?)
  const { titleCls, borderCls } = dayClasses(day);
  const date = toDateObj(day);
  const canDrop = useCallback(types => types.includes("json/draftday"), []);

  // Global state
  const { data, isLoading, error } = useDraftQuery();
  const [ updateDraft ] = useUpdateDraftMutation();
  
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
          if data && data[draftId]
            DragBlock.relative.p-1.m-1.rounded-xl.text-center(
              storeData=({ id: draftId, day })
              onDrop=dropHandler
              isAvailable=isEditing
              dataType="json/draftday"
              canDrop=canDrop
              key=draftId
            )
              - var status = data[draftId].status || 0

              if isEditing
                .text-sm.font-normal.pointer-events-none(
                  className=(data[draftId].isDone ? "dim-color" : "link-color")
                )= data[draftId].title
                
                if status < 3
                  .absolute.top-0.right-1.text-sm.font-normal.cursor-pointer(
                    className="hover:"+(statusInfo[status].class)
                    onClick=editDraft(draftId)
                  ) ✐

              else
                Link.text-sm.font-normal.block(
                  to="/draft/"+draftId
                  className=(data[draftId].isDone ? "dim-color" : "")
                )= data[draftId].title

          else
            .text-sm.font-thin.text-center.dim-color.italic.pointer-events-none(key=draftId) Missing
                
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