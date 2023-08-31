import { playerAccess } from "../../assets/constants";

// Constants
export const READ = 1, WRITE = 2;

// Player Data layout
const commonRows = [
  { title: 'Name',     key: 'name',     editable: true, required: true },
];

const playerOnlyRows = [
  { title: 'Access',   key: 'access',   editable: true, formatString: playerAccess },
  { title: 'Password', key: 'password', editable: true, type: 'password' },
  { title: 'Session',  key: 'session',  editable: true },
];

const teamOnlyRows = [
  {
    title: 'Members', key: 'members',
    formatString: (r,p) => p ? r.map(m => p[m] ? p[m].name : '?').join(' & ') : '',
  },
];

export default function getProfileLayout(isTeam) { return commonRows.concat(isTeam ? teamOnlyRows : playerOnlyRows); }


// Layout based on access [ 0: guest, 1: user, 2: admin, 3: owner ]
const profileACL = [
  /* User  > !Self  (0) */ { name: READ },
  /* User  >  Self  (1) */ { name: READ | WRITE, password: READ | WRITE },
  /* Admin >  Self  (2) */ { name: READ | WRITE, password: READ | WRITE, session: WRITE, access: READ },
  /* Admin > !Owner (3) */ { name: READ | WRITE, password: WRITE, session: WRITE, access: READ },
  /* Admin >  Owner (4) */ { name: READ, access: READ },
  /* Owner > Anyone (5) */ { name: READ | WRITE, password: READ | WRITE, session: WRITE, access: READ | WRITE },
]

// Build ACL based off current user & target user
export const getProfileACL = (user = {}, target = {}) =>
  /* Owner */ user.access > 2       ? profileACL[5] :
  /* Guest */ !user.access          ? profileACL[0] :
  /* Self  */ user.id === target.id ? profileACL[user.access] :
  /* User  */ user.access === 1     ? profileACL[0] :
  /* Admin */ target.access > 2     ? profileACL[4] : profileACL[3]
