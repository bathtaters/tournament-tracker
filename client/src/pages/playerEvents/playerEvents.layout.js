import { dayClasses } from "./services/playerEvent.services";
import { statusInfo } from "../../assets/constants";
import { idToUrl } from "../common/services/idUrl.services";

// Component layout
const scheduleRows = [
  { 
    title: 'Day', 
    value: ({day}) => day ? day.slice(5,10).replace(/-/g,'/') : 'None', 
    class: ({day}) => dayClasses(day && day.slice(0,10)).titleCls,
  },
  { title: 'Event', value: d => d.title, span: 3, link: d => `/event/${idToUrl(d.id)}` },
  {
    title: 'Status', span: 2,
    value: ({isDrop, status}) => statusInfo[status || 0].label + (isDrop ? " (Dropped)" : ""),
    class: ({status}) => statusInfo[status || 0].class,
  },
  { title: 'Wins',   value: ({ record }) => record[0], hideBelow: 2 },
  { title: 'Losses', value: ({ record }) => record[1], hideBelow: 2 },
  { title: 'Draws',  value: ({ record }) => record[2], hideBelow: 2 },
];

export default scheduleRows;