-------------------------------------
-- Update DB from v2.1 API to v3.0 --
-------------------------------------

-- Add TEAMS table to database --
---------------------------------

CREATE TABLE team (
    -- Base
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    eventid UUID REFERENCES event(id) ON DELETE CASCADE,
    name STRING NULL,
    players UUID[] NOT NULL DEFAULT '{}',

    -- Indexes
    INDEX event_idx (eventid) STORING (name, players)
);

-- Add new FORMATS to EVENTS table --
-------------------------------------

CREATE TYPE EVENT_FORMAT AS ENUM ('swiss', 'robin', 'eliminate');
ALTER TABLE "event" ADD COLUMN format EVENT_FORMAT DEFAULT 'swiss';

CREATE TYPE TEAM_TYPE AS ENUM ('solo', 'unified', 'distributed');
ALTER TABLE "event" ADD COLUMN team TEAM_TYPE DEFAULT 'solo';

-- NOTE: events.roundcount will be used as 'elimination count' for 'eliminate' tournaments