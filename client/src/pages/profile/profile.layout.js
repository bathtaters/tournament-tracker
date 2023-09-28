import { playerAccess } from "../../assets/constants";
import { getBaseData } from "../../core/services/validation.services";
const limits = getBaseData('player').limits

// Constants
export const READ = 1, WRITE = 2;

// Player Data layout
const commonRows = [
  { label: 'Name', id: 'name', required: true, minLength: limits.name.min, maxLength: limits.name.max },
];

const playerOnlyRows = [
  { label: 'Password', id: 'password', type: 'password', setValueAs: () => '12345678', minLength: limits.password.min, maxLength: limits.password.max },
  { label: 'Access',   id: 'access',   type: playerAccess },
  { label: 'Session',  id: 'session' },
];

const teamOnlyRows = [
  {
    label: 'Members', id: 'members', disabled: true,
    setValueAs: (r,p) => p ? r.map(m => p[m] ? p[m].name : '?').join(' & ') : '',
  },
];

export default function getProfileLayout(isTeam) { return commonRows.concat(isTeam ? teamOnlyRows : playerOnlyRows); }


// Layout based on access [ 0: guest, 1: player, 2: judge, 3: gonti ]
const profileACL = [
  /* Player > !Self  (0) */ { name: READ },
  /* Player >  Self  (1) */ { name: READ | WRITE, password: READ | WRITE },
  /* Judge  >  Self  (2) */ { name: READ | WRITE, password: READ | WRITE, access: READ },
  /* Judge  > !Gonti (3) */ { name: READ | WRITE, access: READ },
  /* Judge  >  Gonti (4) */ { name: READ, access: READ },
  /* Gonti  > Anyone (5) */ { name: READ | WRITE, password: READ | WRITE, session: WRITE, access: READ | WRITE, reset: true },
]

// Build ACL based off current user & target user
export const getProfileACL = (user = {}, target = {}) =>
  /* Gonti  */ user.access > 2       ? profileACL[5] :
  /* Guest  */ !user.access          ? profileACL[0] :
  /* Self   */ user.id === target.id ? profileACL[user.access] :
  /* Player */ user.access === 1     ? profileACL[0] :
  /* Judge  */ target.access > 2     ? profileACL[4] : profileACL[3]
