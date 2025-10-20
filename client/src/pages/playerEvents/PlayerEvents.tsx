import DataTable from "common/DataTable/DataTable";
import Loading from "common/Loading/Loading";
import RawData from "common/RawData/RawData";
import {
  HeaderStyle,
  tableHdrStyle,
  WrapperStyle,
} from "./styles/PlayerEventStyles";

import eventsLayout from "./playerEvents.layout";
import {
  useEventQuery,
  usePlayerEventsQuery,
  usePlayerMatchesQuery,
  usePlayerQuery,
  usePrefetchEvent,
  useTeamQuery,
} from "./playerEvents.fetch";
import { convertTeams } from "./services/playerEvents.utils";

export default function PlayerEvents({ id }: { id: string }) {
  // Fetch global state
  const { data: eventIds, isLoading, error } = usePlayerEventsQuery(id);
  const {
    data: matches,
    isLoading: matchLoad,
    error: matchErr,
  } = usePlayerMatchesQuery(id);
  const {
    data: events,
    isLoading: eventLoad,
    error: eventErr,
  } = useEventQuery(null);
  const {
    data: teams,
    isLoading: teamLoad,
    error: teamErr,
  } = useTeamQuery(null);
  const {
    data: players,
    isLoading: playLoad,
    error: playErr,
  } = usePlayerQuery(null);

  // Setup pre-fetching
  const prefetch = usePrefetchEvent();

  // Handle loading/errors
  const [loading, err] = [
    isLoading || matchLoad || eventLoad || playLoad || teamLoad,
    error || matchErr || eventErr || playErr || teamErr,
  ];
  if (loading || err || !events || !Array.isArray(eventIds))
    return (
      <WrapperStyle>
        <DataTable
          colLayout={eventsLayout}
          className="mx-4"
          hdrClass={tableHdrStyle}
        >
          <Loading loading={loading} error={err} altMsg="Not found" />
        </DataTable>
      </WrapperStyle>
    );

  // Render
  const teamMap = convertTeams(id, eventIds, teams, events, players);
  return (
    <WrapperStyle>
      <HeaderStyle>Schedule</HeaderStyle>

      <DataTable
        colLayout={eventsLayout}
        rowIds={eventIds}
        extra={{ events, matches, teamMap }}
        rowLink="event/"
        className="mx-4"
        cellClass="py-1"
        hdrClass={tableHdrStyle}
        onRowHover={prefetch}
      >
        – None –
      </DataTable>

      <RawData className="mt-6" data={{ eventIds, matches, teamMap }} />
    </WrapperStyle>
  );
}
