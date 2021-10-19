import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import PropTypes from 'prop-types';

function Report({title, match, players, hideModal, setData}) {
  return pug`
    .fixed.top-0.left-0.w-screen.h-screen.z-40.base-bgd.bg-opacity-50.flex.justify-center.items-center.p-8
      .alt-bgd.shadow-lg.rounded-lg.relative.p-8.overflow-auto.max-h-full.text-center
        input.absolute.top-0.right-0(type="button" value="X" onClick=hideModal)

        h3.font-light.bright-color.text-center.mb-4= 'Report for '+title

        ReportForm(match=match, players=players, hideModal=hideModal, setData=setData)
  `;
}

function ReportForm({ match, players, hideModal, setData }) {
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
    </Fragment>
  ))

  return (
    <form onSubmit={handleSubmit(submitReport)}>
      <div className="grid grid-cols-2 grid-flow-row gap-2">
        {playerRows}
        <label htmlFor="Rdraws" className="text-right">Draws</label>
        <input type="number" id="Rdraws" min="0" max="3" defaultValue={match.draws || 0} {...register('draws')} />
      </div>
      
      <input type="submit" value="Submit" className="m-4" />
    </form>
  );
}


Report.propTypes = {
  title: PropTypes.string,
  match: PropTypes.object,
  players: PropTypes.object,
  hideModal: PropTypes.func,
  setData: PropTypes.func,
};

ReportForm.propTypes = {
  match: PropTypes.object,
  players: PropTypes.object,
  hideModal: PropTypes.func,
  setData: PropTypes.func,
};

export default Report;