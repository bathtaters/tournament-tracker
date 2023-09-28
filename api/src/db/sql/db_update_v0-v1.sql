---------------------------------
-- Update DB from v0 API to v1 --
---------------------------------


-- Add User Accounts --
-----------------------
UPDATE player SET name = id WHERE name IS NULL;
ALTER TABLE player ALTER COLUMN name SET NOT NULL;
ALTER TABLE player
ADD COLUMN password STRING NULL,
ADD COLUMN access SMALLINT NOT NULL DEFAULT 1,
ADD COLUMN session UUID NULL,
ADD COLUMN lower_name STRING AS (lower(name)) STORED;
ALTER TABLE player ADD CONSTRAINT unique_name UNIQUE (lower_name);

-- Uncomment next line + change ? to name of player to become owner
-- UPDATE player SET access = 3 WHERE name = '?';



-- Add Schedule Planner --
--------------------------
ALTER TABLE event
ADD COLUMN plan BOOL NOT NULL DEFAULT false,
ADD COLUMN playercount SMALLINT NOT NULL DEFAULT 8;

UPDATE event SET playercount = COALESCE(ARRAY_LENGTH(players, 1), 8);

CREATE TABLE voter (
    id UUID PRIMARY KEY NOT NULL,
    days DATE[] NOT NULL DEFAULT '{}',
    events UUID[] NOT NULL DEFAULT '{}'
);

DROP VIEW schedule;

DROP VIEW eventDetail;

CREATE VIEW eventDetail (
    id, title, players, playercount, playerspermatch,
    day, slot, roundactive, roundcount, wincount, notes, link,
    allreported,
    anyreported,
    byes,
    drops
) AS SELECT
    event.id, event.title, event.players, playercount, playerspermatch,
    day, slot, roundactive, roundcount, wincount, notes, link,
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

-- Run the following git commands on the server --
-- git branch -m master main
-- git fetch origin
-- git branch -u origin/main main
-- git remote set-head origin -a
-- # Find/Replace "master" with "main" in any scripts