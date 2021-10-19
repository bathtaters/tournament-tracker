import React from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import { weekdays } from '../assets/strings';
import { sameDay } from "../controllers/getDays";

function Day({ data, drafts }) {
  const today = new Date();
  const isToday = sameDay(data.day, today);
  const titleCls = isToday ? "bright-color" : data.day && data.day > today ? "base-color" : "dim-color";
  
  return pug`
    .p-2.m-1.border.rounded-md.w-40.min-h-32(className="border-gray-" + (isToday ? "800" : "4 00")+" dark:border-gray-" + (isToday ? "200" : "600"))
      h4.text-2xl.font-light.text-center(className=titleCls)= data.day ? weekdays[data.day.getDay()] : 'Unscheduled'

      h5.text-center.italic.text-sm.font-thin.mb-2= data.day ? data.day.toLocaleDateString() : ''

      if data.drafts
        ul.list-disc.list-inside.dim-color
          each draftId in data.drafts
            li.overflow-ellipsis.whitespace-nowrap.overflow-hidden(key=draftId)
              Link.text-sm.font-normal(
                to="/draft/"+draftId,
                className=(drafts[draftId].isDone ? "dim-color" : ""),
              )= drafts[draftId].title

      else
        div.text-center.text-sm.font-light.dim-color.italic No drafts
  `;
}

Day.propTypes = {
  data: PropTypes.object,
  drafts: PropTypes.object,
};

export default Day;