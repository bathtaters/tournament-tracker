import React from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

function Day(props) {
  return pug`
    .p-2.m-1.border.border-gray-600
      h4.text-2xl.font-light.text-center= props.data.day ? props.data.day.toLocaleDateString() : 'Unscheduled'
      ul.list-disc.list-inside.text-gray-600
        each draftId in props.data.drafts
          li
            Link.text-sm.font-normal(
              to="/draft?id="+draftId,
              className=(props.drafts[draftId].isDone ? "text-gray-500" : ""),
            )= props.drafts[draftId].title
  `;
}

Day.propTypes = {
  data: PropTypes.object,
  drafts: PropTypes.object,
};

export default Day;