import type { MatchData, Player, PlayerRecord, Team } from "types/models";
import type { SwapDragData } from "types/base";
import DragBlock, { DragBlockProps } from "../../../common/DragBlock/DragBlock";
import {
  NameStyle,
  playerBoxStyle,
  PlayerDropStyle,
  PlayerInfoStyle,
  VsStyle,
} from "../styles/MatchStyles";
import { DropButton } from "../styles/ButtonStyles";
import { dataType } from "../services/swap.services";
import { useLinkId } from "../../../common/General/services/idUrl.services";
import { formatRecord, formatTeamName } from "../../../assets/formatting";

type MatchPlayerProps = {
  id: Player["id"];
  player?: Player;
  team?: Team & { members: Player[] };
  matchData: MatchData;
  handleSwap: DragBlockProps<SwapDragData, SwapDragData>["onDrop"];
  handleDrop: (playerid: Player["id"], undrop: boolean) => any;
  canSwap: DragBlockProps<SwapDragData, SwapDragData>["dropCheck"];
  isEditing?: boolean;
  index: number;
  record: PlayerRecord;
};

function MatchPlayer({
  id,
  player,
  team,
  matchData,
  handleSwap,
  handleDrop,
  canSwap,
  isEditing,
  index,
  record,
}: MatchPlayerProps) {
  const playerUrl = useLinkId(id, "profile/");
  const isDrop = matchData.drops && matchData.drops.includes(id);
  const clickDrop = () => handleDrop(id, isDrop);

  const dragItem: SwapDragData = {
    id: matchData.id,
    playerid: id,
    reported: matchData.players?.length !== 1 && matchData.reported,
  };

  return (
    <>
      {Boolean(index) && <VsStyle>vs.</VsStyle>}

      <DragBlock
        type={dataType}
        item={dragItem}
        onDrop={handleSwap}
        dropCheck={canSwap}
        className={playerBoxStyle}
        disabled={!isEditing}
      >
        {!player && team ? (
          <div
            className="tooltip"
            data-tip={team.members
              .map((m) => m.name)
              .filter(Boolean)
              .join(", ")}
          >
            <NameStyle linkTo={null}>{formatTeamName(team) ?? "?"}</NameStyle>
          </div>
        ) : (
          <NameStyle linkTo={!isEditing && player ? playerUrl : null}>
            {player?.name ?? "?"}
          </NameStyle>
        )}

        {player && team && (
          <div className="text-xs font-thin text-neutral-content -mt-1 mb-1">
            {formatTeamName(team)}
          </div>
        )}

        <PlayerInfoStyle isDrop={isDrop}>
          {isDrop ? "Dropped" : formatRecord(record)}

          <PlayerDropStyle visible={isEditing && matchData.reported}>
            <DropButton isDrop={isDrop} onClick={clickDrop} />
          </PlayerDropStyle>
        </PlayerInfoStyle>
      </DragBlock>
    </>
  );
}

export default MatchPlayer;
