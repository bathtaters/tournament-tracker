import { dayClasses } from "../schedule/services/date.utils";
import { statusInfo } from "../../assets/constants"
import { formatRecord, formatMatchStatus } from "../../assets/formatting";

// Player Schedule Columns
const eventsLayout = [
  { 
    label: 'Date', default: 'TBD', cellStyle: {align: 'center', size: 'md'}, hdrClass: 'mr-2',
    className: (id, {events}) => dayClasses(events[id]?.day?.slice(0,10)).titleCls + ' mr-2',
    get: (id, {events}) => events[id]?.day?.slice(5,10).replace(/-/g,'/'), 
  },
  {
    label: 'Event', cellStyle: {align: 'left', weight: 'normal', size: 'lg'}, default: '?',
    hdrClass: 'text-left', className: 'text-primary',
    get: (id, {events}) => events[id]?.title, span: 3,
  },
  {
    label: 'Status', span: 2, cellStyle: {align: 'left', size: 'md', color: ''}, default: statusInfo[0].label, hdrClass: 'text-left',
    className: (id, {events}) => statusInfo[events[id]?.status ?? 0].textClass,
    get: (id, {events, matches}) => formatMatchStatus(statusInfo[events[id]?.status ?? 0].label, matches[id]?.isDrop),
  },
  {
    label: 'Record', cellStyle: {size: 'lg'},
    get: (id, {events, matches}) => events[id]?.status > 2 ? formatRecord(matches[id]?.record, 0) : '',
  },
]

export default eventsLayout