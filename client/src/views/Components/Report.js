import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import PropTypes from 'prop-types';

function Report({ title, match, players, hideModal, setData }) {
  const { register, handleSubmit } = useForm();

  const submitReport = reportData => {
    Object.keys(reportData).forEach(k => reportData[k] = +(reportData[k] || 0))
    const draws = reportData.draws;
    delete reportData.draws;
    setData({...match, players: reportData, draws, reported: true});
    hideModal();
  };

  const playerRows = Object.keys(match.players).map(pid => (
    <Fragment key={pid+"R"}>
      <label htmlFor={pid} className="text-right">{players[pid].name}</label>
      <input type="number" id={pid} min="0" max="2" defaultValue={match.players[pid] || 0} {...register(pid)} />
      <div>
        <input type="checkbox" id={'DROP:'+pid} {...register('DROP:'+pid)} />
        <label htmlFor={'DROP:'+pid} className="font-thin dim-color ml-1">Drop</label>
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
          <input type="number" id="Rdraws" min="0" max="3" defaultValue={match.draws || 0} {...register('draws')} />
          <div />
        </div>
        
        <input type="submit" value="Submit" className="mt-6 mx-auto block" />
      </form>
    </div>
  );
}


Report.propTypes = {
  title: PropTypes.string,
  match: PropTypes.object,
  players: PropTypes.object,
  hideModal: PropTypes.func,
  setData: PropTypes.func,
};

export default Report;