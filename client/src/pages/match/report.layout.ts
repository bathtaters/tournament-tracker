import type { Player } from "types/models";
import type { FormLayout } from "pages/common/types/InputForm";
import { reportStyles } from "./styles/ReportStyles";
import { getBaseData } from "core/services/validation.services";

const matchBase = getBaseData("match");

export type ReportData = {
  wins: number[];
  drops: Record<string, boolean>;
  draws: number;
};

export default function reportLayout(
  playerList: string[],
  players: Record<string, Player>,
  wincount?: number,
): FormLayout<ReportData>[] {
  return [
    ...playerList.map((pid, idx) => [
      // Each player - wins
      {
        id: "wins." + idx,
        type: "number",
        label: (players[pid] && players[pid].name) || pid,
        labelClass: reportStyles.wins,
        inputClass: "",
        inputWrapperClass: reportStyles.counterWrappers,
        defaultValue: matchBase.defaults.draws,
        min: matchBase.limits.draws.min,
        max: wincount,
        isFragment: true,

        // Each player - drop
      },
      {
        label: "Drop",
        id: "drops." + pid,
        type: "checkbox",
        className: reportStyles.drop,
        labelClass: reportStyles.dropLabel,
        inputClass: reportStyles.dropInput,
        labelPosition: "right",
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
