import type { Player, Team } from "types/models";
import {
  TeamListRowContainer,
  TeamRowSubtitleStyle,
  TeamRowTitleStyle,
} from "../styles/TeamEditorStyles";
import Loading from "../../../common/Loading/Loading";

export default function TeamListEntry({
  team,
  players = {},
  lock,
  onClick,
}: {
  team?: Team;
  players?: Record<Player["id"], Player>;
  lock?: boolean;
  onClick?: () => void;
}) {
  if (!team)
    return (
      <TeamListRowContainer>
        <Loading loading={true} className="-m-4" />
      </TeamListRowContainer>
    );

  const playerList = team.players
    .map((playerId) => players[playerId]?.name ?? "?")
    .join(", ");

  return (
    <TeamListRowContainer disable={lock} onClick={onClick}>
      <TeamRowTitleStyle>{team.name || playerList}</TeamRowTitleStyle>
      {team.name && <TeamRowSubtitleStyle>{playerList}</TeamRowSubtitleStyle>}
    </TeamListRowContainer>
  );
}
