import PropTypes from "prop-types";
import InputForm from "../../common/InputForm";
import {
  ReportStyle,
  ReportTitleStyle,
  reportStyles,
} from "../styles/ReportStyles";
import { reportAdapter } from "../services/match.services";
import { useCallback } from "react";

export default function Report({ title, match, report, layout, lock, close }) {
  // Actions
  const submitReport = useCallback(
    (reportData) => {
      report(reportAdapter(reportData, match.id, match.eventid));
      close(true);
    },
    [match.id, match.eventid, report, close]
  );

  // Render
  return (
    <ReportStyle>
      <ReportTitleStyle>Report for {title}</ReportTitleStyle>
      <InputForm
        rows={layout}
        submitLabel="Report"
        onSubmit={submitReport}
        onEdit={lock}
        isGrid={true}
        className={reportStyles.form}
      />
    </ReportStyle>
  );
}

Report.propTypes = {
  title: PropTypes.string,
  match: PropTypes.object,
  report: PropTypes.func.isRequired,
  layout: PropTypes.array.isRequired,
  modal: PropTypes.object.isRequired,
};
