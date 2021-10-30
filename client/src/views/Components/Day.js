import React from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import { weekdays } from '../../assets/strings';
import { sameDay } from "../../controllers/getDays";

import dragHandle, { preventDef } from '../../controllers/dragAndDrop';

// Highlight on drag class style
const highlightCss = ['border-double','bg-opacity-50','max-border'];

function Day({ data, drafts, isEditing, swapDrafts, setDraftModal }) {
  const today = new Date();
  const isToday = sameDay(data.day, today);
  const titleCls = isToday ? "max-color" : data.day && data.day > today ? "base-color" : "dim-color-inv";
  const borderCls = isToday ? "pos-border" : data.day && data.day > today ? "base-border" : "dimmer-border";
  
  const editDraft = draftId => () => setDraftModal(draftId);

  return pug`
    .p-2.m-1.border.rounded-md.w-40.min-h-32.max-bgd.bg-opacity-0.border-opacity-100(
      className=(isEditing ? "border-dashed dim-border" : borderCls)
      onDragEnter=dragHandle.enter(highlightCss)
      onDragOver=preventDef
      onDragLeave=dragHandle.leave(highlightCss)
      onDrop=dragHandle.drop({ day: data.day }, swapDrafts, highlightCss)
    )
      h4.text-2xl.font-light.text-center.pointer-events-none(
        className=titleCls
      )= data.day ? weekdays[data.day.getDay()] : 'Unscheduled'

      h5.text-center.italic.text-sm.font-thin.mb-2.pointer-events-none= data.day ? data.day.toLocaleDateString() : ''

      if data.drafts && data.drafts.length
        each draftId in data.drafts
          .relative.border.border-dashed.rounded-xl.dimmer-border.border-opacity-0.m-1.p-1.max-bgd.bg-opacity-0.text-center(
            className=(isEditing ? "border-opacity-100 hover:bg-opacity-50" : "")
            draggable=isEditing
            onDragStart=dragHandle.start({ id: draftId, day: data.day })
            onDragEnter=dragHandle.enter(highlightCss)
            onDragOver=preventDef
            onDragLeave=dragHandle.leave(highlightCss)
            onDrop=dragHandle.drop({ id: draftId, day: data.day }, swapDrafts, highlightCss)
            key=draftId
          )
            if isEditing
              .text-sm.font-normal.pointer-events-none(
                className=(drafts[draftId].isDone ? "dim-color" : "link-color")
              )= drafts[draftId].title

              .absolute.top-0.right-1.text-sm.font-normal.cursor-pointer(
                className="hover:pos-color"
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
  drafts: PropTypes.object,
  isEditing: PropTypes.bool,
  swapDrafts: PropTypes.func,
  setDraftModal: PropTypes.func,
};

export default Day;