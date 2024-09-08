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
    action LOG_ACTION DEFAULT 'update', -- Type of change
    data JSONB NULL,        -- Attempted update to data
    userid UUID NULL,       -- Who made the change (Nullable to allow deleting users)
    error STRING NULL,      -- NULL if update succeeded, otherwise error message
    ts TIMESTAMPTZ DEFAULT current_timestamp(), -- Date/Time of update

    -- Foreign Keys
    FOREIGN KEY (userid) REFERENCES player(id) ON DELETE SET NULL ON UPDATE CASCADE,

    -- Indexes
    INDEX time_idx (ts), -- sort
    INDEX row_idx (tableid) -- filter
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




-- Non-SQL Updates --
---------------------

