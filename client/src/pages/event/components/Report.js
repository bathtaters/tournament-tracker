import React from "react";
import PropTypes from 'prop-types';

import { reportStyles, ReportTitleStyle } from "../styles/MatchStyles";
import InputForm from "../../common/InputForm";

import { useReportMutation } from "../event.fetch";
import { reportAdapter } from "../services/event.services";
import valid from "../../../assets/validation.json";


function Report({ title, match, players, wincount, eventid, modal }) {

  // Actions
  const [ report ] = useReportMutation();
  const submitReport = reportData => {
    report(reportAdapter(reportData, match.id, eventid));
    modal.current.close(true);
  };

  // Build Input Rows
  const reportRows = match.players.map((pid,idx) => [
    {
      id: 'wins.'+idx, type: 'number',
      label: (players[pid] && players[pid].name) || pid,
      labelClass: reportStyles.wins,
      defaultValue: valid.defaults.match.draws,
      min: valid.limits.match.draws.min,
      max: wincount,
      isFragment: true,
    },{ 
      label: 'Drop', id: 'drops.'+pid, type: 'checkbox',
      className: reportStyles.dropInput,
      labelClass: reportStyles.drop,
      labelIsRight: true,
    },
  ]).concat([[
    {
      label: 'Draws', id: 'draws', type: 'number', 
      labelClass: reportStyles.draw,
      defaultValue: valid.defaults.match.draws,
      min: valid.limits.match.draws.min,
      max: valid.limits.match.draws.max,
      isFragment: true,
    }, 'spacer'
  ]]);

  // Render
  return (
    <div>
      <ReportTitleStyle>Report for {title}</ReportTitleStyle>
      <InputForm
        rows={reportRows}
        submitLabel="Report"
        onSubmit={submitReport}
        onEdit={modal.current.lock}
        isGrid={true}
        className={reportStyles.form}
      />
    </div>
  );
}

Report.propTypes = {
  title: PropTypes.string,
  match: PropTypes.object,
  players: PropTypes.object,
  wincount: PropTypes.number,
  eventid: PropTypes.string,
  modal: PropTypes.object,
};

export default Report;