import { reportStyles } from "./ReportStyles";
import valid from "../../../assets/validation.json";

export default function reportLayout(playerList, players, wincount) {
  return playerList.map((pid,idx) => [
    
    // Each player - wins
    {
      id: 'wins.'+idx, type: 'number',
      label: (players[pid] && players[pid].name) || pid,
      labelClass: reportStyles.wins,
      defaultValue: valid.defaults.match.draws,
      min: valid.limits.match.draws.min,
      max: wincount,
      isFragment: true,

    // Each player - drop
    },{ 
      label: 'Drop', id: 'drops.'+pid, type: 'checkbox',
      className: reportStyles.dropInput,
      labelClass: reportStyles.drop,
      labelIsRight: true,
    },

  ]).concat([[

    // Draws
    {
      label: 'Draws', id: 'draws', type: 'number', 
      labelClass: reportStyles.draw,
      defaultValue: valid.defaults.match.draws,
      min: valid.limits.match.draws.min,
      max: valid.limits.match.draws.max,
      isFragment: true,
    },
    'spacer'
  ]]);
}