-------------------------------------
-- Update DB from v2.1 API to v3.0 --
-------------------------------------

-- Add TEAMS table to database --
---------------------------------

CREATE TABLE team (
    -- Base
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name STRING NULL,
    players UUID[] NOT NULL DEFAULT '{}',

    -- Indexes
    INVERTED INDEX player_idx (players)
);


-- Add new FORMATS to EVENTS table --
-------------------------------------

CREATE TYPE EVENT_FORMAT AS ENUM ('swiss', 'robin', 'eliminate');
ALTER TABLE "event" ADD COLUMN format EVENT_FORMAT DEFAULT 'swiss';

CREATE TYPE TEAM_TYPE AS ENUM ('solo', 'unified', 'distributed');
ALTER TABLE "event" ADD COLUMN team TEAM_TYPE DEFAULT 'solo';

ALTER TABLE "event" ADD COLUMN teamsize SMALLINT NOT NULL DEFAULT 1;

-- NOTE: events.roundcount will be used as 'elimination count' for 'eliminate' tournaments


-- Remove TEAMS from PLAYERS table --
-------------------------------------

DROP INDEX player@team_idx;
DROP INDEX player@member_idx;
ALTER TABLE "player" DROP COLUMN isteam;
ALTER TABLE "player" DROP COLUMN members;
