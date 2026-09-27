import type { Player, Team } from "types/models";
import { AutoGenTeamStyle } from "../styles/TeamEditorStyles";

type AutoGenProps = {
  teamsize: number;
  setTeamsize: (size: number) => void;
  players: Record<Player["id"], Player>;
  onAutoGenerate?: (size: number, playerIds: Team["players"]) => void;
};

export default function AutoGenTeam({
  teamsize,
  setTeamsize,
  players,
  onAutoGenerate,
}: AutoGenProps) {
  if (!onAutoGenerate) return;

  const playerIds = Object.keys(players).filter((id) => !players[id].hide);

  const handleChange = (
    update?:
      | { teamsize: number }
      | ((data: { teamsize: number }) => { teamsize: number }),
  ) => {
    const val =
      typeof update === "function"
        ? update({ teamsize })?.teamsize
        : update?.teamsize;
    setTeamsize(val ?? teamsize);
  };

  return (
    <AutoGenTeamStyle
      id="teamsize"
      type="number"
      min={1}
      value={teamsize}
      onChange={(ev) => setTeamsize(parseInt(ev.target.value) || 0)}
      onClick={() => onAutoGenerate(teamsize, playerIds)}
      handleChange={handleChange}
    />
  );
}
