import { reportStyles } from "./styles/ReportStyles";
import { getBaseData } from "../../core/services/validation.services";
const matchBase = getBaseData('match')

export default function reportLayout(playerList, players, wincount) {
  return playerList.map((pid,idx) => [
    
    // Each player - wins
    {
      id: 'wins.'+idx, type: 'number',
      label: (players[pid] && players[pid].name) || pid,
      labelClass: reportStyles.wins,
      inputClass: ' ',
      inputWrapperClass: reportStyles.counterWrappers,
      defaultValue: matchBase.defaults.draws,
      min: matchBase.limits.draws.min,
      max: wincount,
      isFragment: true,

    // Each player - drop
    },{ 
      label: 'Drop', id: 'drops.'+pid, type: 'checkbox',
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
      defaultValue: matchBase.defaults.draws,
      min: matchBase.limits.draws.min,
      max: matchBase.limits.draws.max,
      isFragment: true,
    },
    'spacer'
  ]]);
}