-------------------------------------
-- Update DB from v2.1 API to v3.0 --
-------------------------------------

-- Add TEAMS table to database --
---------------------------------

CREATE TABLE team
(
    -- Base
    id      UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name    STRING           NULL,
    players UUID[]           NOT NULL DEFAULT '{}',

    -- Indexes
    INVERTED INDEX player_idx (players)
);


-- Add new FORMATS to EVENTS table --
-------------------------------------

CREATE TYPE EVENT_FORMAT AS ENUM ('MONRAD', 'DUTCH', 'ROBIN', 'ELIM');
ALTER TABLE "event"
    ADD COLUMN format EVENT_FORMAT NOT NULL DEFAULT 'MONRAD';

CREATE TYPE TEAM_TYPE AS ENUM ('UNIFIED', 'DISTRIB');
ALTER TABLE "event"
    ADD COLUMN team TEAM_TYPE NULL;

ALTER TABLE "event"
    ADD COLUMN teamsize SMALLINT NOT NULL DEFAULT 1;

-- NOTE: events.roundcount will be used as 'elimination count' for 'eliminate' tournaments


-- Remove TEAMS from PLAYERS table --
-------------------------------------

DROP INDEX IF EXISTS player@team_idx;
DROP INDEX IF EXISTS player@member_idx;
ALTER TABLE "player"
    DROP COLUMN IF EXISTS isteam;
ALTER TABLE "player"
    DROP COLUMN IF EXISTS members;


-- Add format/team to eventDetail --
------------------------------------

DROP VIEW eventDetail;

CREATE VIEW eventDetail
            (
             id, title, players, format, team, teamsize,
             playercount, playerspermatch, clocklimit, day, slot,
             roundactive, roundcount, wincount, notes, link,
             allreported,
             anyreported,
             byes,
             drops
                )
AS
SELECT event.id,
       MAX(event.title),
       ARRAY_AGG(DISTINCT event.players)[1],
       MAX(format),
       MAX(team),
       MAX(teamsize),
       MAX(playercount),
       MAX(playerspermatch),
       MAX(clocklimit),
       MAX(day),
       MAX(slot),
       MAX(roundactive),
       MAX(roundcount),
       MAX(wincount),
       MAX(notes),
       MAX(link),
       BOOL_AND(reported),
       BOOL_OR(reported) FILTER (
           WHERE match.round = roundactive AND ARRAY_LENGTH(match.players, 1) != 1),
       ARRAY_AGG(match.players[1]) FILTER (WHERE ARRAY_LENGTH(match.players, 1) = 1),
       JSON_AGG(drops) FILTER (WHERE drops IS NOT NULL)
FROM event
         LEFT JOIN match ON event.id = match.eventid
GROUP BY event.id;


-- Update order of matchDetail --
---------------------------------

DROP VIEW matchdetail;

CREATE VIEW matchDetail
            (
             id, eventid, round, reported,
             draws, drops,
             maxwins, totalwins,
             players, wins
                )
AS
SELECT match.id,
       eventid,
       MAX(round),
       MAX(reported),
       MAX(draws),
       ARRAY_AGG(DISTINCT drops)[1],
       MAX(player.win),
       SUM(player.win),
       ARRAY_AGG(DISTINCT players)[1],
       ARRAY_AGG(DISTINCT wins)[1]
FROM match,
     UNNEST(players, wins) player(id, win)
GROUP BY match.id, eventid
ORDER BY array_length(match.players, 1) DESC, match.id;


-- Update DB version Number --
------------------------------
UPSERT
INTO settings (id, value)
VALUES ('dbversion', '3.0.0');
