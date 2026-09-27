import type { EventData } from "types/models";
import { Modal, useModal } from "../../../common/Modal/Modal";
import Loading from "../../../common/Loading/Loading";
import Stats from "../../stats/Stats";
import StatsRow from "./subcomponents/StatsRow";
import {
  EventStatsStyle,
  ModalTitleStyle,
  StatsRowStyle,
  ViewStatsStyle,
} from "../styles/StatsStyles";
import { usePlayerQuery, useStatsQuery, useTeamQuery } from "../event.fetch";
import { apiPollMs } from "../../../assets/config";
import { formatTeamName } from "../../../assets/formatting";

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
  } = usePlayerQuery(null);
  const {
    data: teams,
    isLoading: teamLoading,
    error: teamError,
  } = useTeamQuery(null);

  // Loading/Error catcher
  if (
    isLoading ||
    loadingPlayers ||
    teamLoading ||
    error ||
    playerError ||
    teamError
  )
    return (
      <Loading
        loading={isLoading || loadingPlayers || teamLoading}
        error={error || playerError || teamError}
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
        {(isRanked ? data.ranking : event.players).map((pid, idx) => {
          const team = teams[pid];
          const tooltip =
            event.team === "UNIFIED" && team?.players
              ? team.players
                  .map((mid) => players[mid]?.name)
                  .filter(Boolean)
                  .join(", ")
              : undefined;
          return (
            <StatsRow
              rowNum={isRanked && idx + 1}
              id={pid}
              name={players[pid]?.name ?? formatTeamName(team, players)}
              isDrop={event.drops?.includes(pid)}
              record={data[pid]?.matchRecord}
              disableLink={!!event.team}
              tooltip={tooltip}
              key={pid}
            />
          );
        })}
      </StatsRowStyle>

      <Modal backend={backend}>
        <ModalTitleStyle>{event.title + " Stats"}</ModalTitleStyle>
        <Stats eventid={event.id} />
      </Modal>
    </EventStatsStyle>
  );
}
