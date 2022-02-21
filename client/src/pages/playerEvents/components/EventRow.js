import React from "react";
import PropTypes from "prop-types";

import EventCell from "./EventCell";
import scheduleRows from "../playerEvents.layout";

function EventRow({ data, results, prefetch }) {
  const combo = Object.assign({}, data, results); // append match data
  return scheduleRows.map(row => (<EventCell key={data.id+'_'+row.title} row={row} data={combo} prefetch={prefetch} />));
}

EventRow.propTypes = { data: PropTypes.object, results: PropTypes.object, prefetch: PropTypes.func };

export default EventRow;