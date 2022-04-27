import React from "react"
import PropTypes from 'prop-types'

import InputForm from "../../common/InputForm"
import { ReportStyle, ReportTitleStyle, reportStyles } from "../styles/ReportStyles"

import { reportAdapter } from "../services/match.services"

function Report({ title, match, report, layout, modal }) {

  // Actions
  const submitReport = reportData => {
    report(reportAdapter(reportData, match.id, match.eventid));
    modal.current.close(true);
  }

  // Render
  return (
    <ReportStyle>
      <ReportTitleStyle>Report for {title}</ReportTitleStyle>
      <InputForm
        rows={layout}
        submitLabel="Report"
        onSubmit={submitReport}
        onEdit={modal.current.lock}
        isGrid={true}
        className={reportStyles.form}
      />
    </ReportStyle>
  )
}

Report.propTypes = {
  title: PropTypes.string,
  match: PropTypes.object,
  report: PropTypes.func.isRequired,
  layout: PropTypes.array.isRequired,
  modal: PropTypes.object.isRequired,
}

export default Report