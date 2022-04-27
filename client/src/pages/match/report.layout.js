import { reportStyles } from "./styles/ReportStyles";
import valid from "../../assets/validation.json";

export default function reportLayout(playerList, players, wincount) {
  return playerList.map((pid,idx) => [
    
    // Each player - wins
    {
      id: 'wins.'+idx, type: 'number',
      label: (players[pid] && players[pid].name) || pid,
      labelClass: reportStyles.wins,
      inputClass: ' ',
      inputWrapperClass: reportStyles.counterWrappers,
      defaultValue: valid.defaults.match.draws,
      min: valid.limits.match.draws.min,
      max: wincount,
      isFragment: true,

    // Each player - drop
    },{ 
      label: 'Drop', id: 'drops.'+pid, type: 'toggle',
      className: reportStyles.drop,
      labelClass: reportStyles.dropLabel,
      inputClass: reportStyles.dropInput,
      labelPosition: 'right',
    },

  ]).concat([[

    // Draws
    {
      label: 'Draws', id: 'draws', type: 'number', 
      labelClass: reportStyles.draw,
      inputClass: ' ',
      inputWrapperClass: reportStyles.counterWrappers,
      defaultValue: valid.defaults.match.draws,
      min: valid.limits.match.draws.min,
      max: valid.limits.match.draws.max,
      isFragment: true,
    },
    'spacer'
  ]]);
}