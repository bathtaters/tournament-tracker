import { statusInfo } from "../../assets/strings";
import { dayClasses } from "../schedule/services/day.services";

// Layout for InputForm

// Player Data layout
const commonRows = [
  { title: 'Name', key: 'name', editable: true },
];

const playerOnlyRows = [];

const teamOnlyRows = [
  { title: 'Members', key: 'members', formatString: (r,p) => r.map(m=>p[m].name).join(' & ') },
];


export default {
  player: (isTeam) => commonRows.concat(isTeam ? teamOnlyRows : playerOnlyRows),

  // Player Schedule layout
  schedule: [
    { 
      title: 'Day', 
      value: ({day}) => day ? day.slice(5,10).replace(/-/g,'/') : 'None', 
      class: ({day}) => dayClasses(day && day.slice(0,10)).titleCls,
    },
    { title: 'Event', span: 3, value: d => d.title, link: d => `/event/${d.id}` },
    {
      title: 'Status', span: 2,
      value: ({isdrop, status}) => statusInfo[status || 0].label + (isdrop ? " (Dropped)" : ""),
      class: ({status}) => statusInfo[status || 0].class,
    },
    { title: 'Wins', value: ({wins}) => wins, hideBelow: 2 },
    { title: 'Losses', value: d => d.count == null ? null : d.count - (d.wins || 0) - (d.draws || 0), hideBelow: 2 },
    { title: 'Draws', value: ({draws}) => draws, hideBelow: 2 },
  ]
};