-- Initialize DB --

SET sql_safe_updates = FALSE;

USE defaultdb;
DROP DATABASE IF EXISTS %DB% CASCADE;
COMMIT;

BEGIN;
SET sql_safe_updates = TRUE;
CREATE DATABASE IF NOT EXISTS %DB%;

USE %DB%;


-- TYPES/ENUMS --

CREATE TYPE LOG_ACTION AS ENUM ('create', 'update', 'upsert', 'delete', 'login');


-- BASE TABLES --

CREATE TABLE settings (
    id STRING PRIMARY KEY NOT NULL,
    value STRING,
    type STRING NOT NULL DEFAULT 'string'
);

CREATE TABLE player (
    -- Base
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name STRING,
    password STRING NULL,
    access SMALLINT NOT NULL DEFAULT 1,
    session STRING NULL,
    credits DECIMAL DEFAULT 0,
    hide BOOL DEFAULT false,

    -- Team
    isteam BOOLEAN NOT NULL DEFAULT FALSE,
    members UUID[] NULL,

    -- Index
    INDEX team_idx (isteam) STORING (name, members),
    INVERTED INDEX member_idx (members) WHERE isteam IS TRUE,

    -- Rules
    lower_name STRING AS (lower(name)) STORED,
    CONSTRAINT unique_name UNIQUE (lower_name)
);

CREATE TABLE event (
    -- Base
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    title STRING NULL,
    day DATE NULL,
    slot SMALLINT NOT NULL DEFAULT 0,
    plan BOOL NOT NULL DEFAULT false,
    players UUID[] NOT NULL DEFAULT '{}',
    playercount SMALLINT NOT NULL DEFAULT 8,
    roundactive SMALLINT NOT NULL DEFAULT 0,
    roundcount SMALLINT NOT NULL DEFAULT 3,
    wincount SMALLINT NOT NULL DEFAULT 2,
    playerspermatch SMALLINT NOT NULL DEFAULT 2,
    notes STRING NOT NULL DEFAULT '',
    link STRING NOT NULL DEFAULT '',

    -- Clock base (clocklimit set by user, others set by start/stop/etc)
    clocklimit INTERVAL NOT NULL DEFAULT '60 mins',
    clockstart TIMESTAMPTZ NULL,
    clockmod INTERVAL NULL,

    -- Index
    INDEX date_idx (day) STORING (slot),
    INVERTED INDEX player_idx (players)
);

CREATE TABLE match (
    -- Base
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    eventid UUID REFERENCES event(id) ON DELETE CASCADE,
    round SMALLINT NOT NULL,
    players UUID[] NOT NULL,
    wins SMALLINT[] NOT NULL,
    draws SMALLINT NOT NULL DEFAULT 0,
    drops UUID[] NOT NULL DEFAULT '{}',
    reported BOOLEAN NOT NULL DEFAULT FALSE,

    -- Indexes
    INDEX event_idx (eventid, round) STORING (players, draws, reported),
    INVERTED INDEX player_idx (players)
);

CREATE TABLE voter (
    id UUID PRIMARY KEY NOT NULL,
    days DATE[] NOT NULL DEFAULT '{}',
    events UUID[] NOT NULL DEFAULT '{}'
);

CREATE TABLE log (
    -- Base
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    dbtable STRING,         -- Table that was changed
    tableid STRING NULL,    -- Row that was changed (Should only be NULL if action = CREATE and error != NULL)
    action LOG_ACTION,      -- Type of change
    data JSONB NULL,        -- Attempted update to data
    userid UUID NULL,       -- Who made the change (Nullable to allow deleting users)
    sessionid STRING NULL,  -- Session ID of who made the change
    error STRING NULL,      -- NULL if update succeeded, otherwise error message
    ts TIMESTAMPTZ DEFAULT current_timestamp(), -- Date/Time of update

    -- Foreign Keys
    FOREIGN KEY (userid) REFERENCES player(id) ON DELETE SET NULL ON UPDATE CASCADE,

    -- Indexes
    INDEX time_idx (ts), -- sort
    INDEX row_idx (tableid), -- filter
    INDEX user_session_idx (userid, sessionid) -- filter
) WITH (ttl_expiration_expression = 'ts + INTERVAL ''1 year''', ttl_job_cron = '@monthly');

CREATE TABLE session (
    -- Session cookies
    sid STRING NOT NULL PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMPTZ NOT NULL,
    
    -- Index
    INDEX IDX_session_expire (expire)
);


-- Perms --
GRANT ALL ON DATABASE %DB% TO db_admin;
GRANT ALL ON TABLE * TO db_admin;
GRANT INSERT, UPDATE, DELETE, SELECT ON TABLE * TO db_rw;
GRANT SELECT ON TABLE * TO db_read;


-- COMBO VIEWS --

CREATE VIEW eventDetail (
    id, title, players, playercount, playerspermatch,
    clocklimit, day, slot, roundactive, roundcount, wincount, notes, link,
    allreported,
    anyreported,
    byes,
    drops
) AS SELECT
    event.id, event.title, event.players, playercount, playerspermatch,
    clocklimit, day, slot, roundactive, roundcount, wincount, notes, link,
    BOOL_AND(reported),
    BOOL_OR(reported) FILTER(
        WHERE match.round = roundactive AND ARRAY_LENGTH(match.players, 1) != 1),
    ARRAY_AGG(match.players[1]) FILTER(WHERE ARRAY_LENGTH(match.players, 1) = 1),
    JSON_AGG(drops)
FROM event
LEFT JOIN match ON event.id = match.eventid
GROUP BY event.id;


CREATE VIEW matchDetail (
    id, eventid, round, reported,
    draws, drops,
    maxwins, totalwins,
    players, wins
) AS SELECT
    match.id, eventid, round, reported,
    draws, drops,
    MAX(player.win), SUM(player.win),
    players, wins
FROM match, UNNEST(players,wins) player(id,win)
GROUP BY match.id ORDER BY match.id;


-- INVERTED INDEX QUERIES --

CREATE VIEW eventOpps (playerid, eventid, oppids)
AS SELECT playerid, eventid, ARRAY_AGG(oppid)
FROM match,
    UNNEST(match.players) playerid,
    UNNEST(match.players) oppid
WHERE oppid != playerid GROUP BY eventid, playerid;


-- ADD VERSION NUMBER TO DB --
INSERT INTO settings (id, value) VALUES ('dbversion', '2.0.0');