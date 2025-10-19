import type { Player, Team } from "types/models";
import { Link } from "react-router-dom";
import EyeIcon from "../../common/icons/EyeIcon";
import { idToUrl } from "../../common/General/services/idUrl.services";
import { formatTeamName } from "../../assets/formatting";

type NameProps = {
  player?: Player;
  team?: Team & { members: Player[] };
};

export const BasicPlayerNameStyle = ({ player, team }: NameProps) =>
  player?.name ? (
    <>
      {player.hide && (
        <EyeIcon isOpen={false} className="w-8 absolute left-2 opacity-80" />
      )}
      <div>
        <span className={player.hide ? "opacity-80" : ""}>
          {player.name ?? formatTeamName(team)}
        </span>
      </div>
    </>
  ) : team ? (
    <div>{formatTeamName(team)}</div>
  ) : undefined;

export function FullPlayerNameStyle({ player, team }: NameProps) {
  if (!player?.name && !team) return undefined;

  const name = player ? player.name : team?.name;

  return (
    <>
      <div className="flex flex-col">
        {name && (
          <span className={player?.hide ? "opacity-80" : ""}>{name}</span>
        )}

        {team?.members && (
          <div>
            {team.members.map(({ id, name }) => (
              <Link
                className="px-1 text-base font-sans text-base-content/70 link-hover"
                to={`/profile/${idToUrl(id)}`}
                key={id}
              >
                {name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {player?.hide && (
        <EyeIcon
          isOpen={false}
          className="w-8 pl-2 inline-block align-middle opacity-80"
        />
      )}
    </>
  );
}
