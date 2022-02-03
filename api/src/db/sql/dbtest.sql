-- Select DB
USE tournamenttracker;

-- Erase all entries
SET sql_safe_updates = FALSE;
DELETE FROM event *;
DELETE FROM match *;
DELETE FROM player *;
SET sql_safe_updates = TRUE;


-- Setup Settings
INSERT INTO settings (id, value, type) VALUES
    ('title','Tournament Tracker Demo','string'),
    ('datestart','2022-02-01','string'),
    ('dateend','2022-02-09','string'),
    ('showadvanced','true','boolean'),
    ('showrawjson','false','boolean'),
    ('autobyes','true','boolean'),
    ('dayslots','4','number');


-- Setup Players
INSERT INTO player (name) VALUES
    ('Nick'), ('Matt'), ('Cosme'), ('Taylor'),
    ('Ian'),  ('Foff'), ('Stack'), ('Henry');

-- Setup Teams
INSERT INTO player (name, isteam, members) VALUES
    ('NI', TRUE, ARRAY(SELECT id FROM player@team_idx WHERE
        isteam IS FALSE AND name = ANY('{"Nick","Ian"}'))),
    ('MF', TRUE, ARRAY(SELECT id FROM player@team_idx WHERE
        isteam IS FALSE AND name = ANY('{"Matt","Foff"}'))),
    ('CS', TRUE, ARRAY(SELECT id FROM player@team_idx WHERE
        isteam IS FALSE AND name = ANY('{"Cosme","Stack"}'))),
    ('TH', TRUE, ARRAY(SELECT id FROM player@team_idx WHERE
        isteam IS FALSE AND name = ANY('{"Taylor","Henry"}')));

-- Setup Events
INSERT INTO event (title, day, roundcount) VALUES
    ('KLD',  '2020-10-05', 5),
    ('AKH',  '2020-10-07', 1);
INSERT INTO event (title, day, wincount, roundcount, playerspermatch) VALUES
    ('CPY',  '2020-10-07', 1, 1, 4);

-- Create Maches for Two-Headed AKH Event
INSERT INTO match (eventid, round, players, wins) VALUES
    (
        (SELECT id FROM event WHERE title = 'AKH'), 1,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS TRUE AND name = ANY('{"NI","MF"}')
        ), '{0,0}'
    ),(
        (SELECT id FROM event WHERE title = 'AKH'), 1,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS TRUE AND name = ANY('{"CS","TH"}')
        ), '{0,0}'
    );

-- Create Matches for Conspiracy event
INSERT INTO match (eventid, round, players, wins) VALUES
    (
        (SELECT id FROM event WHERE title = 'CPY'), 1,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS FALSE AND name = ANY('{"Nick","Ian","Matt","Foff"}')
        ), '{0,0,0,0}'
    ),(
        (SELECT id FROM event WHERE title = 'CPY'), 1,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS FALSE AND name = ANY('{"Cosme","Stack","Taylor","Henry"}')
        ), '{0,0,0,0}'
    ),(
-- Create Matches for noraml KLD event
        (SELECT id FROM event WHERE title = 'KLD'), 1,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS FALSE AND name = ANY('{"Nick","Ian"}')
        ), '{0,0}'
    ),(
        (SELECT id FROM event WHERE title = 'KLD'), 1,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS FALSE AND name = ANY('{"Matt","Foff"}')
        ), '{0,0}'
    ),(
        (SELECT id FROM event WHERE title = 'KLD'), 1,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS FALSE AND name = ANY('{"Cosme","Stack"}')
        ), '{0,0}'
    ),(
        (SELECT id FROM event WHERE title = 'KLD'), 1,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS FALSE AND name = ANY('{"Taylor","Henry"}')
        ), '{0,0}'
    ),
    ((SELECT id FROM event WHERE title = 'KLD'), 2,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS FALSE AND name = ANY('{"Nick","Henry"}')
        ), '{0,0}'
    ),
    ((SELECT id FROM event WHERE title = 'KLD'), 2, 
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS FALSE AND name = ANY('{"Matt","Ian"}')
        ), '{0,0}'
    ),
    ((SELECT id FROM event WHERE title = 'KLD'), 2,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS FALSE AND name = ANY('{"Cosme","Foff"}')
        ), '{0,0}'
    ),
    ((SELECT id FROM event WHERE title = 'KLD'), 2,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS FALSE AND name = ANY('{"Taylor","Stack"}')
        ), '{0,0}'
    ),
    ((SELECT id FROM event WHERE title = 'KLD'), 3, 
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS FALSE AND name = ANY('{"Taylor","Ian"}')
        ), '{0,0}' 
    ),
    ((SELECT id FROM event WHERE title = 'KLD'), 3, 
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS FALSE AND name = ANY('{"Nick","Foff"}')
        ), '{0,0}' 
    ),
    ((SELECT id FROM event WHERE title = 'KLD'), 3, 
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS FALSE AND name = ANY('{"Matt","Stack"}')
        ), '{0,0}' 
    );
INSERT INTO match (eventid, round, players, wins) VALUES
    ((SELECT id FROM event WHERE title = 'KLD'), 3, 
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS FALSE AND name = ANY('{"Cosme","Henry"}')
        ), '{0,0}' 
    );
INSERT INTO match (eventid, round, players, wins) VALUES
    ((SELECT id FROM event WHERE title = 'KLD'), 4, 
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS FALSE AND name = 'Nick'
        ), '{0}' 
    );
INSERT INTO match (eventid, round, players, wins) VALUES
    ((SELECT id FROM event WHERE title = 'AKH'), 4, 
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isteam IS FALSE AND name = 'Ian'
        ), '{0}' 
    );

-- Retroactively set Event participants & round
WITH eventMatches AS (SELECT
        eventid AS id,
        array_agg(DISTINCT playerid::UUID) AS players
    FROM match@event_idx, unnest(players) AS playerid
    GROUP BY eventid)
UPDATE event SET (players, roundactive) = 
    (eventMatches.players, IF(event.title = 'KLD', 4, 1))
    FROM eventMatches WHERE event.id = eventMatches.id;

-- Set records for testing
UPDATE match SET (wins,draws,reported) =
    ('{0,1,0,0}'::SMALLINT[], 0, TRUE)
WHERE eventid = (SELECT id FROM event WHERE title = 'CPY');

UPDATE match SET (wins,draws,reported) = (
    IF(round = 3, ('{0,0}'), ('{0,2}')),
    IF(round = 3 OR round = 4, 0, 1),
    IF(round = 4, FALSE, TRUE)
)
WHERE eventid = (SELECT id FROM event WHERE title = 'KLD') 
AND round != 4;
