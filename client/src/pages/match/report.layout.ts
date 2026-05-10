import type { MatchReport, Player, Team } from "types/models";
import type { FormLayout } from "common/InputForm/InputForm.d";
import { reportStyles } from "./styles/ReportStyles";
import { getBaseData } from "core/services/validation.services";
import { formatTeamName } from "../../assets/formatting";

const matchBase = getBaseData("match");

export default function reportLayout(
  playerList: Player["id"][],
  players: Record<Player["id"], Player>,
  teams: Record<Team["id"], Team>,
  wincount?: number,
): FormLayout<MatchReport>[] {
  return [
    ...playerList.map((pid, idx) => [
      // Each player - wins
      {
        id: "wins." + idx,
        type: "number",
        label: players[pid]?.name || formatTeamName(teams[pid], players) || pid,
        labelClass: reportStyles.wins,
        inputClass: "",
        inputWrapperClass: reportStyles.counterWrappers,
        defaultValue: matchBase.defaults.draws,
        min: matchBase.limits.draws.min,
        max: wincount,
      },
      // Each player - drop
      {
        label: "Drop",
        id: "drops." + pid,
        type: "checkbox",
        className: reportStyles.drop,
        labelClass: reportStyles.dropLabel,
        inputClass: reportStyles.dropInput,
        labelPosition: "right",
        isFragment: false,
      },
    ]),
    // Draws
    [
      {
        label: "Draws",
        id: "draws",
        type: "number",
        labelClass: reportStyles.draw,
        inputClass: "",
        inputWrapperClass: reportStyles.counterWrappers,
        defaultValue: matchBase.defaults.draws,
        min: matchBase.limits.draws.min,
        max: matchBase.limits.draws.max,
        isFragment: true,
      },
      "spacer",
    ],
  ];
}
