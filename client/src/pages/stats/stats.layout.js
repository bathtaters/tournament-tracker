import { formatPercent } from '../../assets/formatting';

// Stats table classes
const hdrClass = 'text-md sm:text-lg',
  indexStyle = { size: 'base', color: 'primary',   weight: 'light',  align: 'right'  },
  titleStyle = { size: 'lg',   color: 'secondary', weight: 'light',  align: 'left'   },
  listStyle  = { size: 'lg',   color: 'secondary', weight: 'light',  align: 'center' };

// Stats columns
const statsLayout = [
  { label: '',     get: 'index', cellStyle: indexStyle },
  { label: 'Name', get: (id, {players}) => players[id]?.name, cellStyle: titleStyle, hdrClass: 'text-lg', default: '?' },
  { label: 'W',    get: (id, {stats}) => stats[id]?.matchRecord?.[0], hdrClass: 'text-lg', default: '-' },
  { label: 'L',    get: (id, {stats}) => stats[id]?.matchRecord?.[1], hdrClass: 'text-lg', default: '-' },
  { label: 'D',    get: (id, {stats}) => stats[id]?.matchRecord?.[2], hdrClass: 'text-lg', default: '-' },
  { label: 'G',    get: (id, {stats}) => stats[id]?.gameRate, format: formatPercent, hdrClass: 'text-lg', default: '-' },
  { label: 'OMW',  get: (id, {stats}) => stats[id]?.oppMatch, format: formatPercent, default: '-', hdrClass },
  { label: 'OGW',  get: (id, {stats}) => stats[id]?.oppGame,  format: formatPercent, default: '-', hdrClass },
]
const listLayout = [
  { get: (id, {players}) => players[id]?.name, cellStyle: listStyle, hdrClass: 'text-lg', default: '?' },
]

export { statsLayout, listLayout  }