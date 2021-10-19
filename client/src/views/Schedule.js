import React from "react";
import PropTypes from 'prop-types';
import Day from "./Components/Day";
import getDays from "../controllers/getDays";

function Schedule({ schedule, drafts, range }) {
  const dayArray = getDays(range, schedule);
  return pug`
    div
      h2.text-center.font-thin Schedule
      .flex.flex-wrap.justify-center.mt-4
        each dayBlock in dayArray
          Day(data=dayBlock drafts=drafts key=dayBlock.day ? dayBlock.day.toISOString() : 'NULL')
  `;
}

Schedule.propTypes = {
  schedule: PropTypes.arrayOf(PropTypes.object),
  drafts: PropTypes.object,
  range: PropTypes.arrayOf(PropTypes.object),
};

export default Schedule;