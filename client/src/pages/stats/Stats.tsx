import DataTable from "common/DataTable/DataTable";
import RawData from "common/RawData/RawData";
import Loading from "common/Loading/Loading";
import {
  useAccessLevel,
  usePlayerQuery,
  useSettingsQuery,
  useStatsQuery,
  useTeamQuery,
} from "common/General/common.fetch";
import statsLayout from "./stats.layout";
import { getPlayerList } from "./services/stats.services";
import { apiPollMs } from "assets/config";

type StatsProps = {
  eventid?: string;
  onPlayerClick?: (id: string) => void;
  className?: string;
  highlightClass?: string;
  hideStats?: boolean;
  hideHidden?: boolean;
  showCredits?: boolean;
};

export default function Stats({
  eventid,
  onPlayerClick,
  className = "table-zebra",
  highlightClass = "",
  hideStats,
  hideHidden,
  showCredits,
}: StatsProps) {
  // Global state
  const { access } = useAccessLevel();
  const {
    data: stats,
    isLoading,
    error,
  } = useStatsQuery(eventid, {
    skip: access < 3 && hideStats,
    pollingInterval: apiPollMs,
  });
  const {
    data: players,
    isLoading: playLoad,
    error: playErr,
  } = usePlayerQuery(null, { pollingInterval: apiPollMs });
  const {
    data: teams,
    isLoading: teamLoad,
    error: teamErr,
  } = useTeamQuery(null, { pollingInterval: apiPollMs });
  const {
    data: settings,
    isLoading: sLoad,
    error: sErr,
    // @ts-ignore -- RTK imports have incorrect arg count
  } = useSettingsQuery();

  const playerList = getPlayerList(
    stats?.ranking,
    players,
    teams,
    !eventid,
    hideHidden,
  );
  const enableCredits =
    sLoad || sErr ? showCredits : showCredits && settings.showcredits;

  // Loading/Error catcher
  if (
    isLoading ||
    playLoad ||
    teamLoad ||
    sLoad ||
    error ||
    playErr ||
    teamErr ||
    sErr
  )
    return (
      <DataTable
        colLayout={statsLayout(true, enableCredits)}
        className={className}
      >
        <Loading
          loading={isLoading || playLoad || teamLoad || sLoad}
          error={error || playErr || teamErr || sErr}
        />
      </DataTable>
    );

  // Render
  const isTeam = playerList[0] in teams;
  return (
    <div className="w-full overflow-auto">
      <DataTable
        colLayout={statsLayout(hideStats, enableCredits)}
        rowIds={playerList}
        extra={{ stats, players, teams }}
        rowLink={isTeam ? undefined : "profile/"}
        rowClass={highlightClass}
        className={className}
        hdrClass="text-center mb-2"
        onRowClick={onPlayerClick}
      >
        No players exist
      </DataTable>

      <RawData className="text-sm" data={stats} />
    </div>
  );
}
