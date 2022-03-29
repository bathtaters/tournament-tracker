import { formatNum } from '../../../assets/formatting';

// Count the total number of columns
export const colCount = (layout) =>
  layout.reduce((s,c) => s + (!c.span || typeof c.span !== 'number' ? 1 : c.span), 0);


// Build stats grid-template
export const layoutTemplate = (layout) => (layout || []).map(({span}) =>
  typeof span === 'string' ? span :
  !span || span === 1 ? 'minmax(0, 1fr)'
    : `repeat(${span}, minmax(0, 1fr))`
).join(' ');


// Get value of cell based on colData (AKA column layout data)
export function getCellValue(colData, index, player, stat) {
  // Empty column
  if (!colData.get) return '';

  // Number column
  else if (colData.get === 'index')
    return index + 1;

  // PlayerData column
  else if (typeof colData.get === 'string')
    return (player && player[colData.get]) || colData.default || '';

  // StatsData column
  else
    return formatNum(stat && colData.get(stat));
}

// Build a playerid list from rank (Include missing players if listAll=true)
export const getPlayerList = (ranking, players, listAll=false, hideTeams=false) => {
  if (!players) return ranking || [];
  let list = [];
  if (ranking) {
    list = ranking.filter(p => players[p]);
    if (listAll) list.push(...Object.keys(players).filter(p => !ranking.includes(p)));
  } else if (listAll) list.push(...Object.keys(players));
  return hideTeams ? list.filter(p => !players[p].isteam) : list;
}