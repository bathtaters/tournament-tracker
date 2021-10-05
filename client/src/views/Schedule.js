import React from "react";
import PropTypes from 'prop-types';
import Day from "./Day";

function Schedule(props) {
  return pug`
    div
      h2.text-center.font-thin Schedule
      .flex.flex-wrap
        each dayBlock in props.data
          Day(data=dayBlock drafts=props.drafts)
  `;
}

Schedule.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  drafts: PropTypes.object,
};

export default Schedule;