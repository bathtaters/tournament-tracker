---------------------------------
-- Update DB from v1 API to v2 --
---------------------------------

-- NOT FINALIZED --

-- Add Player Hiding --
-----------------------
ALTER TABLE player ADD COLUMN hide BOOL DEFAULT false;

-- Add Logging --
-----------------
CREATE TYPE LOG_ACTION AS ENUM ('create', 'update', 'delete', 'login');

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

-- Add express-session Table --
-------------------------------
CREATE TABLE session (
    -- Cookie table
    sid STRING NOT NULL PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMPTZ NOT NULL,
    
    -- Index
    INDEX IDX_session_expire (expire)
);
-- Change player.session from UUID to STRING
ALTER TABLE player DROP COLUMN session;
ALTER TABLE player ADD COLUMN session STRING;


-- Add timer to EventDetail --
------------------------------

DROP VIEW eventDetail;

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


-- Non-SQL Updates --
---------------------

