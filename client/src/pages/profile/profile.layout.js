// Player Data layout
const commonRows = [
  { title: 'Name', key: 'name', editable: true },
];

const playerOnlyRows = [];

const teamOnlyRows = [
  {
    title: 'Members', key: 'members',
    formatString: (r,p) => p ? r.map(m => p[m] ? p[m].name : '?').join(' & ') : '',
  },
];

export default function getProfileLayout(isTeam) { return commonRows.concat(isTeam ? teamOnlyRows : playerOnlyRows); }