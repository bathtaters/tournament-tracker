# lol-retreat API

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
|/all|GET| |{settings,schedule,drafts,players}|All objects in DB|
|/schedule|GET| |{ YYYY-MM-DD: [ draftIds ], ... }|All draftIds by date|
|/settings|GET| |{ setting: value, ... }|All stored settings|
|/settings|PATCH|{ setting: value }|{ success, set: [setting] }|Update setting(s)|

---

### _Draft_ - [Domain]/api/v[n]/draft/...

| URL | Method | Body | Return | Description |
|------|------|------|------|------|
|/all|GET| |{ id: { draftData }, ... }|Data from all drafts by ID|
|/[id]|GET| |{ draftData }|Data from a draft|
|/[id]/stats|GET| |{ playerId: { stats }, ..., ranking: [ids] }|Player stats from a draft|
|/|POST|{ draftData }|{ id }|Create a new draft|
|/[id]|DELETE| |{ id }|Deletes draft from database|
|/[id]|PATCH|{ newData }|{ id, newData }|Update draft data|
|/[id]/round|POST| |{ id, round: #, matches: [ ids ] }|Add a round of matches|
|/[id]/round|DELETE| |{ id, round: # }|Delete the last round|

---

### _Match_ - [Domain]/api/v[n]/match/...

| URL | Method | Body | Return | Description |
|------|------|------|------|------|
|/all|GET| |{ id: { matchData }, ... }|Data from all matches by ID|
|/[id]|GET| |{ matchData }|Data from a match|
|/[id]|POST|{ players, draws, drops }|{ draftId, id }|Report match result|
|/[id]|DELETE| |{ draftId, id }|Clears match result|
|/[id]|PATCH|{ newResult }|{ draftId, id }|Update results|
|/swap|POST|{ playerA: {id,playerId}, playerB } |{ draftId }|Swap players between matches|

---

### _Player_ -  [Domain]/api/v[n]/player/...

| URL | Method | Body | Return | Description |
|------|------|------|------|------|
|/all|GET| |{ id: { playerData }, ... }|Data from all players by ID|
|/[id]|GET| |{ playerData }|Data from a player|
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
	name STRING
	isTeam BOOLEAN = 0
	members [player.id] = NULL

draft:
	id UUID = random
	title STRING
	day DATE = NULL
	players [player.id] = []
	roundActive SMALLINT = 0
	roundCount SMALLINT = 3
	bestOf SMALLINT = 3,
	playersPerMatch SMALLINT = 2
	
	(clock:)
	clockLimit INTERVAL = 60min
	clockStart TIMESTAMP = NULL
	clockMod INTERVAL = NULL

match:
	id UUID = random
	draftId draft.id
	round SMALLINT
	players { playerId: playerWins, ... }
	draws SMALLINT = 0
	drops UUID[] = []
	reported BOOLEAN = FALSE
```