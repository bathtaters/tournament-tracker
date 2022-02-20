import React from "react";
import PropTypes from "prop-types";

import EventCell from "./EventCell";
import scheduleRows from "../playerEvents.layout";

function EventRow({ data, prefetch }) {
  return scheduleRows.map(row => (<EventCell key={data.id+'_'+row.title} row={row} data={data} prefetch={prefetch} />));
}

EventRow.propTypes = { data: PropTypes.object, prefetch: PropTypes.func };

export default EventRow;