# Tournament Tracker API

###### NOTE: See [/api/src/config/dbServer.md](./src/config/dbServer.md) before running for the first time.

### Current Major Version: v2
_Represented below by api/v[n]_



## API Operations

### _Meta_ -  [Domain]/api/...

| URL | Method | Body | Return | Description |
|------|------|------|------|------|
|/version|GET| |"v[n]"|API version to use|
|/v[n]/meta|GET| |{ connected: t, name, version }|API metadata|
|/v[n]/error|GET| |{ error: message } (Code 418)|Sample error for testing|
|/v[n]/reset|POST| |{ reset: t, full: f }|[dev only] Sets table rows to base state|
|/v[n]/reset/full|POST| |{ reset: t, full: t }|[dev only] Deletes database & rebuilds|

---

### _Base_ - [Domain]/api/v[n]/...

| URL | Method | Body | Return | Description |
|------|------|------|------|------|
|/all|GET| |{settings,schedule,events,players}|All objects in DB|
|/schedule|GET| |{ settings, schedule: { YYYY-MM-DD/none: [ eventids ] } }|Events by date + settings (uses settings.showplan)|
|/schedule/plan|GET| |{ settings, schedule: { YYYY-MM-DD/none: [ eventids ] } }|Planned events by date + relevant settings|
|/settings|GET| |{ setting: value, ... }|All stored settings|
|/settings|PATCH|{ setting: value }|{ success, set: [setting] }|Update setting(s)|

---

### _Session_ - [Domain]/api/v[n]/session/...

| URL | Method | Body | Return | Description |
|------|------|------|------|------|
|/|GET| | |Fetch session cookie|
|/player|GET| |{ playerData }|Get player data from session cookie|
|/|POST|{ name, password }|{ success }|Login (Links session to player)|
|/|DELETE| |{ success }|Logout (Removes player from session)|
|/[id]|POST|{ session }|{ valid, isSet }|Get password reset status for player|

---

### _Voter_ - [Domain]/api/v[n]/voter/...

| URL | Method | Body | Return | Description |
|------|------|------|------|------|
|/all|GET| |{ playerId: { playerVoteData } }|All vote data by playerID|
|/[id]|GET| |{ playerVoteData }|Vote data for player|
|/|POST|{ id }|{ id }|Add player as voter|
|/[id]|PATCH|{ newData }|{ id, newData }|Update player's vote data|

---

### _Plan_ - [Domain]/api/v[n]/plan/...

| URL | Method | Body | Return | Description |
|------|------|------|------|------|
|/status|GET| |{ planStatus }|Get plan status number|
|/save|POST| |[ events ]|Add plan to schedule, de-scheduling exisiting events|
|/generate|POST| |[ events ]|Auto-set dates for plan events|
|/|DELETE| |{ success }|Remove all voters/events from plan|

---

### _Event_ - [Domain]/api/v[n]/event/...

| URL | Method | Body | Return | Description |
|------|------|------|------|------|
|/all|GET| |{ id: { eventData }, ... }|Data from all events by ID|
|/[id]|GET| |{ eventData }|Data from a event|
|/all/stats|GET| |{ playerid: { stats }, ..., ranking: [ids] }|Player stats from all events|
|/[id]/stats|GET| |{ playerid: { stats }, ..., ranking: [ids] }|Player stats from an event|
|/[id]/clock|GET| |{ id, eventClockData... }|Clock data (limit/start/mod) for the event|
|/|POST|{ eventData }|{ id }|Create a new event|
|/plan|POST|{ events: [ ids ] }|[{ id }, ... ]|Set event list for current plan|
|/[id]|DELETE| |{ id }|Deletes event from database|
|/[id]|PATCH|{ newData }|{ id, newData }|Update event data|
|/[id]/clock/[action]|POST| |{ eventData }|Execute the action (run/pause/reset) on the event clock|
|/[id]/round/[round]|POST| |{ id, round: #, matches: [ ids ] }|Add a round of matches|
|/[id]/round/[round]|DELETE| |{ id, round: # }|Delete the last round|
|/all/credits|POST| |{ playerid: credits, ... }|Reset player credits using credits from finished events|
|/all/credits|DELETE| |{ playerid: credits, ... }|Reset player credits to zero|
|/[id]/credits|POST| |{ playerid: newCredits, ... }|Add credits from event to players|
|/[id]/credits|DELETE| |{ playerid: newCredits, ... }|Remove credits from event to players|

---

### _Match_ - [Domain]/api/v[n]/match/...

| URL | Method | Body | Return | Description |
|------|------|------|------|------|
|/all|GET| |{ id: { matchData }, ... }|Data from all matches by ID|
|/[id]|GET| |{ matchData }|Data from a match|
|/[id]|POST|{ players, draws, drops }|{ eventid, id }|Report match result|
|/[id]|DELETE| |{ eventid, id }|Clears match result|
|/[id]|PATCH|{ newResult }|{ eventid, id }|Update results|
|/[id]/drop|PATCH|{ playerid, undrop }|{ eventid, id }|Drop/Undrop player from event|
|/swap|POST|[{id,playerid}, {id,playerid}]|{ eventid }|Swap players between matches|

---

### _Player_ -  [Domain]/api/v[n]/player/...

| URL | Method | Body | Return | Description |
|------|------|------|------|------|
|/all|GET| |{ id: { playerData }, ... }|Data from all players by ID|
|/[id]|GET| |{ playerData }|Data from a player|
|/[id]/events|GET| |[ eventids ]|List of player's events|
|/[id]/matches|GET| |{ eventid: [{ matchData }, ...] }|Data for player's matches|
|/|POST|{ playerData }|{ id }|Create new player|
|/[id]|DELETE| |{ id }|Remove a player|
|/[id]|PATCH|{ newData }|{ id }|Update player data|
|/[id]/reset|POST| |{ session }|Erase password, returning reset session key|

---


## Database

See [DB creation script](./src/db/sql/resetDb.sql) for the database layout.

## Updates

- To update from v0 to v1
	- Run [v1 update script](./src/db/sql/db_update_v0-v1.sql) on any v0 databases.
	- Add `"pwsalt": "[random string]"` to [/api/src/config/dbServer.json](./src//config/dbServer.json)
- To update from v1 to v2 
	- Run [v2 update script](./src/db/sql/db_update_v1-v2.sql) on any v1 databases.
	- Add `"sessionSecret": "[random string]"` to [/api/src/config/dbServer.json](./src//config/dbServer.json)