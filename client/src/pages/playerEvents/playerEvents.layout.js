import { dayClasses } from "../schedule/services/date.utils";
import { statusInfo } from "../../assets/constants"

// Player Schedule Columns
const eventsLayout = [
  { 
    label: 'Date', default: 'TBD', cellStyle: {align: 'right', size: 'md'}, hdrClass: 'text-right mr-2',
    className: (id, {events}) => dayClasses(events[id]?.day?.slice(0,10)).titleCls + ' mr-2',
    get: (id, {events}) => events[id]?.day?.slice(5,10).replace(/-/g,'/'), 
  },
  {
    label: 'Event', cellStyle: {align: 'left', weight: 'normal', size: 'lg'}, default: '?',
    hdrClass: 'text-left', className: 'link',
    get: (id, {events}) => events[id]?.title, span: 3,
  },
  {
    label: 'Status', span: 2, cellStyle: {align: 'left', size: 'md'}, default: statusInfo[0].label, hdrClass: 'text-left',
    className: (id, {events}) => statusInfo[events[id]?.status ?? 0].class,
    get: (id, {events, matches}) => statusInfo[events[id]?.status ?? 0].label + (matches[id]?.isDrop ? " (Dropped)" : ""),
  },
  { label: 'Wins',   get: (id, {events, matches}) => events[id]?.status > 2 ? matches[id]?.record?.[0] : '', cellStyle: {size: 'lg'} },
  { label: 'Losses', get: (id, {events, matches}) => events[id]?.status > 2 ? matches[id]?.record?.[1] : '', cellStyle: {size: 'lg'} },
  { label: 'Draws',  get: (id, {events, matches}) => events[id]?.status > 2 ? matches[id]?.record?.[2] : '', cellStyle: {size: 'lg'} },
]

export default eventsLayout