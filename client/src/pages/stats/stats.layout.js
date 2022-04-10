import { formatPercent } from '../../assets/formatting';

// Stats table classes
const hdrClass = 'text-xs sm:text-xl',
  indexStyle = { size: 'base', color: 'dim',  weight: 'light',  align: 'right'  },
  titleStyle = { size: 'lg',   color: 'max',  weight: 'light',  align: 'left'   };

// Stats columns
const statsLayout = [
  { label: '',     get: 'index', span: 'auto', cellStyle: indexStyle },
  { label: 'Name', get: (id, {players}) => players[id]?.name, span: 'auto', cellStyle: titleStyle, hdrClass: 'text-xl', default: '?' },
  { label: 'W',    get: (id, {stats}) => stats[id]?.matchRecord?.[0], default: '-', hdrClass: 'text-xl' },
  { label: 'L',    get: (id, {stats}) => stats[id]?.matchRecord?.[1], default: '-', hdrClass: 'text-xl' },
  { label: 'D',    get: (id, {stats}) => stats[id]?.matchRecord?.[2], default: '-', hdrClass: 'text-xl' },
  { label: 'G',    get: (id, {stats}) => stats[id]?.gameRate, format: formatPercent, default: '-', hdrClass },
  { label: 'OMW',  get: (id, {stats}) => stats[id]?.oppMatch, format: formatPercent, default: '-', hdrClass },
  { label: 'OGW',  get: (id, {stats}) => stats[id]?.oppGame,  format: formatPercent, default: '-', hdrClass },
]

export default statsLayout