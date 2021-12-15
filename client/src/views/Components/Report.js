import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import PropTypes from 'prop-types';

import { usePlayerQuery } from "../../models/playerApi";
import { useReportMutation } from "../../models/matchApi";

import { formatQueryError } from "../../assets/strings";

function Report({ title, match, hideModal, bestOf, maxWins, draftId }) {
  // Global
  const { data: players, isLoading, error } = usePlayerQuery();
  
  // Local
  const { register, handleSubmit } = useForm();

  // Action
  const [ report ] = useReportMutation();
  const submitReport = reportData => {
    Object.keys(reportData.players).forEach(k => reportData.players[k] = +(reportData.players[k] || 0));
    reportData.draws = +(reportData.draws || 0);
    reportData.drops = Object.keys(reportData.drops).reduce((d,p) => reportData.drops[p] ?  d.concat(p) : d,[]);
    report({ ...reportData, draftId, id: match.id });
    hideModal();
  };

  // Render
  if (isLoading)
    return (<div><h3 className="font-light max-color italic text-center">Loading...</h3></div>);

  else if (error)
    return (<div>
      <h4 className="font-light dim-color text-center">{formatQueryError(error)}</h4>
    </div>);

  const playerRows = Object.keys(match.players).map(pid => (
    <Fragment key={pid+"R"}>
      <label htmlFor={pid} className="text-right">{players[pid].name}</label>
      <input type="number" id={pid} min="0" max={maxWins} defaultValue={match.players[pid] || 0} {...register('players.'+pid)} />
      <div>
        <input type="checkbox" id={'drops.'+pid} {...register('drops.'+pid)} />
        <label htmlFor={'drops.'+pid} className="font-thin dim-color ml-1">Drop</label>
      </div>
    </Fragment>
  ));

  return (
    <div>
      <h3 className="font-light max-color text-center mb-4">Report for {title}</h3>
      <form onSubmit={handleSubmit(submitReport)}>
        <div className="grid grid-cols-3 grid-flow-row gap-2 items-center">
          {playerRows}
          <label htmlFor="Rdraws" className="text-right">Draws</label>
          <input type="number" id="Rdraws" min="0" max={bestOf} defaultValue={match.draws || 0} {...register('draws')} />
          <div />
        </div>
        
        <input type="submit" value="Submit" className="mt-6 mx-auto block" />
      </form>
    </div>
  );
}


Report.propTypes = {
  match: PropTypes.object,
  title: PropTypes.string,
  bestOf: PropTypes.number,
  maxWins: PropTypes.number,
  hideModal: PropTypes.func,
  draftId: PropTypes.string,
};

export default Report;