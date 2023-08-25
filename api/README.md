# Tournament Tracker API

###### NOTE: See `/api/src/config/dbServer.md` before running for the first time.

### Current Major Version: v0
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
|/schedule|GET| |{ YYYY-MM-DD: [ eventids ], ... }|All eventids by date|
|/settings|GET| |{ setting: value, ... }|All stored settings|
|/settings|PATCH|{ setting: value }|{ success, set: [setting] }|Update setting(s)|

---

### _Session_ - [Domain]/api/v[n]/session/...

| URL | Method | Body | Return | Description |
|------|------|------|------|------|
|/|GET|{ session }|{ playerData }|Get session player|
|/|POST|{ name, password }|{ session }|Create session|
|/|DELETE|{ session }|{ success }|Destroy session|

---

### _Event_ - [Domain]/api/v[n]/event/...

| URL | Method | Body | Return | Description |
|------|------|------|------|------|
|/all|GET| |{ id: { eventData }, ... }|Data from all events by ID|
|/[id]|GET| |{ eventData }|Data from a event|
|/[id]/stats|GET| |{ playerid: { stats }, ..., ranking: [ids] }|Player stats from a event|
|/|POST|{ eventData }|{ id }|Create a new event|
|/[id]|DELETE| |{ id }|Deletes event from database|
|/[id]|PATCH|{ newData }|{ id, newData }|Update event data|
|/[id]/round|POST| |{ id, round: #, matches: [ ids ] }|Add a round of matches|
|/[id]/round|DELETE| |{ id, round: # }|Delete the last round|

---

### _Match_ - [Domain]/api/v[n]/match/...

| URL | Method | Body | Return | Description |
|------|------|------|------|------|
|/all|GET| |{ id: { matchData }, ... }|Data from all matches by ID|
|/[id]|GET| |{ matchData }|Data from a match|
|/[id]|POST|{ players, draws, drops }|{ eventid, id }|Report match result|
|/[id]|DELETE| |{ eventid, id }|Clears match result|
|/[id]|PATCH|{ newResult }|{ eventid, id }|Update results|
|/swap|POST|{ playerA: {id,playerid}, playerB } |{ eventid }|Swap players between matches|

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
    access SMALLINT = 2 ('player')
    session UUID = NULL
	isteam BOOLEAN = 0
	members [player.id] = NULL

event:
	id UUID = random
	title STRING
	day DATE = NULL
	slot SMALLINT = 0
	players [player.id] = []
	roundactive SMALLINT = 0
	roundcount SMALLINT = 3
	wincount SMALLINT = 2,
	playerspermatch SMALLINT = 2
	
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
```