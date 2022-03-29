import { formatPercent } from '../../assets/formatting';
// Stats columns

export default [
  { label: '',     get: 'index', span: 'auto', indexStyle: true },
  { label: 'Name', get: 'name',  span: 'auto', titleStyle: true, default: '-' },
  { label: 'W',    get: data => data.matchRecord && data.matchRecord[0], },
  { label: 'L',    get: data => data.matchRecord && data.matchRecord[1], },
  { label: 'D',    get: data => data.matchRecord && data.matchRecord[2], },
  { label: 'G',    get: data => formatPercent(data.gameRate), },
  { label: 'OMW',  get: data => formatPercent(data.oppMatch), },
  { label: 'OGW',  get: data => formatPercent(data.oppGame), },
]