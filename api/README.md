# Tournament Tracker API

###### NOTE: See `/api/src/config/dbServer.md` before running for the first time.

### Current Major Version: v1
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
|/|POST|{ session }|{ playerData }|Get player data from session token|
|/|PUT|{ name, password }|{ session }|Create session|
|/|DELETE|{ session }|{ success }|Destroy session|
|/[id]|POST|{ session }|{ valid, isSet }|Get password reset session status|

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
|/|POST|{ eventData }|{ id }|Create a new event|
|/plan|POST|{ events: [ ids ] }|[{ id }, ... ]|Set event list for current plan|
|/[id]|DELETE| |{ id }|Deletes event from database|
|/[id]|PATCH|{ newData }|{ id, newData }|Update event data|
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


## Database Layout

```
settings:
	id STRING
	value STRING
	type STRING = 'string'

player:
	id UUID = random
	name UNIQUE STRING
	password STRING = NULL
	access SMALLINT = 1 ('player')
	session UUID = NULL
	isteam BOOLEAN = 0
	members [player.id] = NULL

event:
	id UUID = random
	title STRING
	day DATE = NULL
	slot SMALLINT = 0
	plan BOOLEAN = false
	players [player.id] = []
	playercount SMALLINT = 0
	roundactive SMALLINT = 0
	roundcount SMALLINT = 3
	wincount SMALLINT = 2
	playerspermatch SMALLINT = 2
	notes STRING NOT NULL DEFAULT ''
    link STRING NOT NULL DEFAULT ''
	
	(clock:)
	clocklimit INTERVAL = 60min
	clockstart TIMESTAMP = NULL
	clockmod INTERVAL = NULL

match:
	id UUID = random
	eventid event.id
	round SMALLINT
	players [player.id]
	wins [SMALLINT]
	draws SMALLINT = 0
	drops UUID[] = []
	reported BOOLEAN = FALSE

voter:
	id UUID = player.id
	days DATE[] = []
	events UUID[] = []
```