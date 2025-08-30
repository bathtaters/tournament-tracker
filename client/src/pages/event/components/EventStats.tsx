import type { EventData } from "types/models";
import { Modal, useModal } from "common/Modal/Modal";
import Loading from "common/Loading/Loading";
import Stats from "pages/stats/Stats";
import StatsRow from "./subcomponents/StatsRow";
import {
  EventStatsStyle,
  ModalTitleStyle,
  StatsRowStyle,
  ViewStatsStyle,
} from "../styles/StatsStyles";
import { usePlayerQuery, useStatsQuery } from "../event.fetch";
import { apiPollMs } from "assets/config";

export default function EventStats({ event }: { event: EventData }) {
  // Global
  const { backend, open } = useModal();
  const { data, isLoading, error } = useStatsQuery(event.id, {
    pollingInterval: apiPollMs,
  });
  const {
    data: players,
    isLoading: loadingPlayers,
    error: playerError,
    // @ts-ignore -- RTK imports have incorrect arg count
  } = usePlayerQuery();

  // Loading/Error catcher
  if (isLoading || loadingPlayers || error || playerError)
    return (
      <Loading
        loading={isLoading || loadingPlayers}
        error={error || playerError}
        className="text-xs mb-2"
      />
    );

  const isRanked = data?.ranking?.length;

  return (
    <EventStatsStyle title={isRanked ? "Standings" : "Players"}>
      <ViewStatsStyle onClick={isRanked ? open : null}>
        View Stats
      </ViewStatsStyle>

      <StatsRowStyle>
        {(isRanked ? (data.ranking as string[]) : event.players).map(
          (pid, idx) => (
            <StatsRow
              rowNum={isRanked && idx + 1}
              id={pid}
              name={players[pid]?.name}
              isDrop={event.drops?.includes(pid)}
              record={data[pid]?.matchRecord}
              key={pid}
            />
          ),
        )}
      </StatsRowStyle>

      <Modal backend={backend}>
        <ModalTitleStyle>{event.title + " Stats"}</ModalTitleStyle>
        <Stats eventid={event.id} />
      </Modal>
    </EventStatsStyle>
  );
}
