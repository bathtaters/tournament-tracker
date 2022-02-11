import React from "react";
import PropTypes from 'prop-types';

import InputForm from "../../common/InputForm";
import { ReportTitleStyle, reportStyles } from "../styles/ReportStyles";

import { useReportMutation } from "../match.fetch";
import { reportAdapter } from "../services/match.services";

function Report({ title, match, layout, modal }) {

  // Actions
  const [ report ] = useReportMutation();
  const submitReport = reportData => {
    report(reportAdapter(reportData, match.id, match.eventid));
    modal.current.close(true);
  };

  // Render
  return (
    <div>
      <ReportTitleStyle>Report for {title}</ReportTitleStyle>
      <InputForm
        rows={layout}
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
  layout: PropTypes.array,
  modal: PropTypes.object,
};

export default Report;