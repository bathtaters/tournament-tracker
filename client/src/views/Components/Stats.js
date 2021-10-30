import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

function Stats(props) {
  const gridHeader = ['Name','W','L','D','%','OMW','OGW'];
  const clickHandler = pid => event => {
    if (typeof props.onPlayerClick === 'function' && !props.onPlayerClick(pid, event)) return event.preventDefault() || false;
    return true;
  };

  return pug`
    .relative
      .grid.grid-flow-row.grid-cols-stats.gap-x-2.gap-y-1.items-center.px-4.py-2(className=props.className)
        each hdr,idx in gridHeader
          span.font-normal.mb-2.text-center(
            className = (hdr === "Name" ? "col-span-2 " : "text-center ") +
            (hdr.length === 3 ? "text-xs sm:text-xl" : "text-xl"),
            key="H"+idx
          )= hdr

        each pid, idx in props.ranking
          Fragment(key=pid+"S")
            span.font-light.text-right= idx + 1

            Link.text-lg.font-normal.text-left(to="/profile/"+pid onClick=clickHandler(pid))= props.players[pid].name

            each _, i in gridHeader.slice(1)
              span.text-sm.font-thin.text-center(key=pid+"C"+i)= props.players[pid].record[i] == null ? '-' : props.players[pid].record[i]

      .grid.grid-flow-row.grid-cols-1.gap-x-2.gap-y-1.py-2.items-center.absolute.top-0.left-0.right-0.bottom-0.z-0
        .w-full.h-full.opacity-75.mb-2.bg-none

        each pid, idx in props.ranking
          Link.w-full.h-full.px-2.opacity-0.base-bgd-inv(to="/profile/"+pid onClick=clickHandler(pid) className=props.highlightClass+" hover:opacity-25" key=pid+"L")
  `;
}

Stats.propTypes = {
  ranking: PropTypes.arrayOf(PropTypes.string),
  players: PropTypes.object,
  onPlayerClick: PropTypes.func,
  className: PropTypes.string,
  highlightClass: PropTypes.string,
};

export default Stats;