import React from "react";
import PropTypes from 'prop-types';

import InputForm from "../shared/InputForm";

import { usePlayerQuery } from "../../../queries/playerApi";
import { useReportMutation } from "../../../queries/matchApi";

import { formatQueryError } from "../../../assets/strings";

const maxDraws = 9; // TEMP

function Report({ title, match, hideModal, lockModal, wincount, eventid }) {
  // Global
  const { data: players, isLoading, error } = usePlayerQuery();

  // Action
  const [ report ] = useReportMutation();
  const submitReport = reportData => {
    reportData.drops = Object.keys(reportData.drops).reduce((d,p) => reportData.drops[p] ?  d.concat(p) : d,[]);
    report({ ...reportData, eventid, id: match.id });
    hideModal();
  };

  // Render
  if (isLoading)
    return (<div><h3 className="font-light max-color italic text-center">Loading...</h3></div>);

  else if (error)
    return (<div>
      <h4 className="font-light dim-color text-center">{formatQueryError(error)}</h4>
    </div>);

  const playerRows = match.players.map((pid,idx) => [
    {
      id: 'wins.'+idx, type: 'number',
      label: (players[pid] && players[pid].name) || pid,
      labelClass: "text-base sm:text-xl font-medium mx-2 text-right",
      defaultValue: 0, min: 0, max: wincount, isFragment: true,
    },{ 
      label: 'Drop', id: 'drops.'+pid, type: 'checkbox',
      className: "text-xs sm:text-base font-thin mx-2",
      labelClass: "ml-1 dim-color", labelIsRight: true,
    },
  ]).concat([[
    {
      label: 'Draws', id: 'draws', type: 'number', 
      labelClass: "text-base sm:text-xl font-light mx-2 text-right",
      defaultValue: 0, min: 0, max: maxDraws, isFragment: true,
    }, 'spacer'
  ]]);

  return (
    <div>
      <h3 className="font-light max-color text-center mb-4">Report for {title}</h3>
      <InputForm
        rows={playerRows}
        submitLabel="Report"
        onSubmit={submitReport}
        onEdit={lockModal}
        isGrid={true}
        className="grid grid-cols-3 grid-flow-row gap-2 items-center my-8"
      />
    </div>
  );
}


Report.propTypes = {
  match: PropTypes.object,
  title: PropTypes.string,
  wincount: PropTypes.number,
  hideModal: PropTypes.func,
  lockModal: PropTypes.func,
  eventid: PropTypes.string,
};

export default Report;