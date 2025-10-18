import type { MatchData, MatchReport } from "types/models";
import { useCallback } from "react";
import InputForm from "common/InputForm/InputForm";
import { FormLayout } from "common/InputForm/InputForm.d";
import {
  ReportStyle,
  reportStyles,
  ReportTitleStyle,
} from "../styles/ReportStyles";
import { reportAdapter } from "../services/match.services";

type ReportProps = {
  title?: string;
  match: MatchData;
  report: (data: MatchReport) => void;
  layout: FormLayout<MatchReport>[];
  lock: () => void;
  close: (refresh?: boolean) => void;
};

export default function Report({
  title,
  match,
  report,
  layout,
  lock,
  close,
}: ReportProps) {
  // Actions
  const submitReport = useCallback(
    (reportData: MatchReport) => {
      report(reportAdapter(reportData, match.id, match.eventid));
      close(true);
    },
    [match.id, match.eventid, report, close],
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
