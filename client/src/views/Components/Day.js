// TEST DATA
import { draftStatus } from "../../controllers/testing/testDataAPI";

import React, { useCallback } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import DragBlock from './DragBlock';

import { swapDrafts } from '../../models/schedule';
import { sameDay } from '../../controllers/getDays';
import { weekdays, statusInfo } from '../../assets/strings';


// Component class styles
const dayClasses = day => {
  const today = (new Date()).getTime();
  const isToday = sameDay(day, today);
  return {
    titleCls:  isToday ? "max-color"  : day && day > today ? "base-color"  : "dim-color-inv",
    borderCls: isToday ? "pos-border" : day && day > today ? "base-border" : "dimmer-border",
  };
}

// Component
function Day({ data, isEditing, setDraftModal }) {
  const dispatch = useDispatch();

  // Definitions (memoize?)
  const { titleCls, borderCls } = dayClasses(data.day);
  const day = data.day == null ? data.day : new Date(data.day);
  const canDrop = useCallback(types => types.includes("json/draftday"), []);

  // Global state
  const drafts = useSelector(state => state.drafts);
  
  // Actions
  const dropHandler = (a,b) => dispatch(swapDrafts({ a, b }));
  const editDraft = draftId => () => setDraftModal(draftId);

  return pug`
    DragBlock.p-2.m-1.rounded-md.w-40.min-h-32.border-opacity-100(
      storeData=({ id: null, day: data.day })
      onDrop=dropHandler
      unavailableCls=borderCls
      draggable=false
      dataType="json/draftday"
      canDrop=canDrop
      isAvailable=isEditing
    )
      h4.text-2xl.font-light.text-center.pointer-events-none(
        className=titleCls
      )= day ? weekdays[day.getDay()] : 'Unscheduled'

      h5.text-center.italic.text-sm.font-thin.mb-2.pointer-events-none= day ? day.toLocaleDateString() : ''

      if data.drafts && data.drafts.length
        each draftId in data.drafts
          if drafts[draftId]
            DragBlock.relative.p-1.m-1.rounded-xl.text-center(
              storeData=({ id: draftId, day: data.day })
              onDrop=dropHandler
              isAvailable=isEditing
              dataType="json/draftday"
              canDrop=canDrop
              key=draftId
            )
              - var status = draftStatus(drafts[draftId])

              if isEditing
                .text-sm.font-normal.pointer-events-none(
                  className=(drafts[draftId].isDone ? "dim-color" : "link-color")
                )= drafts[draftId].title
                
                if status < 3
                  .absolute.top-0.right-1.text-sm.font-normal.cursor-pointer(
                    className="hover:"+(statusInfo[status].class)
                    onClick=editDraft(draftId)
                  ) ✐

              else
                Link.text-sm.font-normal.block(
                  to="/draft/"+draftId
                  className=(drafts[draftId].isDone ? "dim-color" : "")
                )= drafts[draftId].title
                
      else if !isEditing
        .text-center.text-sm.font-light.dim-color.italic.pointer-events-none.opacity-60 No drafts
  `;
}

Day.propTypes = {
  data: PropTypes.object,
  isEditing: PropTypes.bool,
  setDraftModal: PropTypes.func,
};

export default Day;