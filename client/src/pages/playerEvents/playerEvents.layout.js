import { dayClasses } from "./services/playerEvent.services";
import { statusInfo } from "../../assets/strings";

// Component layout
const scheduleRows = [
  { 
    title: 'Day', 
    value: ({day}) => day ? day.slice(5,10).replace(/-/g,'/') : 'None', 
    class: ({day}) => dayClasses(day && day.slice(0,10)).titleCls,
  },
  { title: 'Event', value: d => d.title, span: 3, link: d => `/event/${d.id}` },
  {
    title: 'Status', span: 2,
    value: ({isdrop, status}) => statusInfo[status || 0].label + (isdrop ? " (Dropped)" : ""),
    class: ({status}) => statusInfo[status || 0].class,
  },
  { title: 'Wins', value: ({wins}) => wins, hideBelow: 2 },
  { title: 'Losses', value: d => d.count == null ? null : d.count - (d.wins || 0) - (d.draws || 0), hideBelow: 2 },
  { title: 'Draws', value: ({draws}) => draws, hideBelow: 2 },
];

export default scheduleRows;