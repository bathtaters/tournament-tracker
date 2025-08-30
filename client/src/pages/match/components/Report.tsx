import type { Match } from "types/models";
import type { ReportData } from "../report.layout";
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
  match: Match;
  report: (data: ReportData) => void;
  layout: FormLayout<ReportData>[];
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
    (reportData: ReportData) => {
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
