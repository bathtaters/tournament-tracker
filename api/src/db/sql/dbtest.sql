-- Select DB
USE lolretreat;

-- Erase all entries
SET sql_safe_updates = FALSE;
DELETE FROM draft *;
DELETE FROM match *;
DELETE FROM player *;
SET sql_safe_updates = TRUE;


-- Setup Settings
INSERT INTO settings (id, value, type) VALUES
    ('title','Lords of Luxury Retreat Demo','string'),
    ('datestart','2020-10-03','string'),
    ('dateend','2020-10-12','string'),
    ('showadvanced','true','boolean'),
    ('showrawjson','false','boolean'),
    ('autobyes','true','boolean'),
    ('dayslots','4','number');


-- Setup Players
INSERT INTO player (name) VALUES
    ('Nick'), ('Matt'), ('Cosme'), ('Taylor'),
    ('Ian'),  ('Foff'), ('Stack'), ('Henry');

-- Setup Teams
INSERT INTO player (name, isTeam, members) VALUES
    ('NI', TRUE, ARRAY(SELECT id FROM player@team_idx WHERE
        isTeam IS FALSE AND name = ANY('{"Nick","Ian"}'))),
    ('MF', TRUE, ARRAY(SELECT id FROM player@team_idx WHERE
        isTeam IS FALSE AND name = ANY('{"Matt","Foff"}'))),
    ('CS', TRUE, ARRAY(SELECT id FROM player@team_idx WHERE
        isTeam IS FALSE AND name = ANY('{"Cosme","Stack"}'))),
    ('TH', TRUE, ARRAY(SELECT id FROM player@team_idx WHERE
        isTeam IS FALSE AND name = ANY('{"Taylor","Henry"}')));

-- Setup Drafts
INSERT INTO draft (title, day, roundCount) VALUES
    ('KLD',  '2020-10-05', 5),
    ('AKH',  '2020-10-07', 1);
INSERT INTO draft (title, day, winCount, roundCount, playersPerMatch) VALUES
    ('CPY',  '2020-10-07', 1, 1, 4);

-- Create Maches for Two-Headed AKH Draft
INSERT INTO match (draftId, round, players, wins) VALUES
    (
        (SELECT id FROM draft WHERE title = 'AKH'), 1,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS TRUE AND name = ANY('{"NI","MF"}')
        ), '{0,0}'
    ),(
        (SELECT id FROM draft WHERE title = 'AKH'), 1,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS TRUE AND name = ANY('{"CS","TH"}')
        ), '{0,0}'
    );

-- Create Matches for Conspiracy draft
INSERT INTO match (draftId, round, players, wins) VALUES
    (
        (SELECT id FROM draft WHERE title = 'CPY'), 1,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS FALSE AND name = ANY('{"Nick","Ian","Matt","Foff"}')
        ), '{0,0,0,0}'
    ),(
        (SELECT id FROM draft WHERE title = 'CPY'), 1,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS FALSE AND name = ANY('{"Cosme","Stack","Taylor","Henry"}')
        ), '{0,0,0,0}'
    ),(
-- Create Matches for noraml KLD draft
        (SELECT id FROM draft WHERE title = 'KLD'), 1,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS FALSE AND name = ANY('{"Nick","Ian"}')
        ), '{0,0}'
    ),(
        (SELECT id FROM draft WHERE title = 'KLD'), 1,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS FALSE AND name = ANY('{"Matt","Foff"}')
        ), '{0,0}'
    ),(
        (SELECT id FROM draft WHERE title = 'KLD'), 1,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS FALSE AND name = ANY('{"Cosme","Stack"}')
        ), '{0,0}'
    ),(
        (SELECT id FROM draft WHERE title = 'KLD'), 1,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS FALSE AND name = ANY('{"Taylor","Henry"}')
        ), '{0,0}'
    ),
    ((SELECT id FROM draft WHERE title = 'KLD'), 2,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS FALSE AND name = ANY('{"Nick","Henry"}')
        ), '{0,0}'
    ),
    ((SELECT id FROM draft WHERE title = 'KLD'), 2, 
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS FALSE AND name = ANY('{"Matt","Ian"}')
        ), '{0,0}'
    ),
    ((SELECT id FROM draft WHERE title = 'KLD'), 2,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS FALSE AND name = ANY('{"Cosme","Foff"}')
        ), '{0,0}'
    ),
    ((SELECT id FROM draft WHERE title = 'KLD'), 2,
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS FALSE AND name = ANY('{"Taylor","Stack"}')
        ), '{0,0}'
    ),
    ((SELECT id FROM draft WHERE title = 'KLD'), 3, 
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS FALSE AND name = ANY('{"Taylor","Ian"}')
        ), '{0,0}' 
    ),
    ((SELECT id FROM draft WHERE title = 'KLD'), 3, 
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS FALSE AND name = ANY('{"Nick","Foff"}')
        ), '{0,0}' 
    ),
    ((SELECT id FROM draft WHERE title = 'KLD'), 3, 
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS FALSE AND name = ANY('{"Matt","Stack"}')
        ), '{0,0}' 
    );
INSERT INTO match (draftId, round, players, wins) VALUES
    ((SELECT id FROM draft WHERE title = 'KLD'), 3, 
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS FALSE AND name = ANY('{"Cosme","Henry"}')
        ), '{0,0}' 
    );
INSERT INTO match (draftId, round, players, wins) VALUES
    ((SELECT id FROM draft WHERE title = 'KLD'), 4, 
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS FALSE AND name = 'Nick'
        ), '{0}' 
    );
INSERT INTO match (draftId, round, players, wins) VALUES
    ((SELECT id FROM draft WHERE title = 'AKH'), 4, 
        ARRAY(
            SELECT id FROM player@team_idx
            WHERE isTeam IS FALSE AND name = 'Ian'
        ), '{0}' 
    );

-- Retroactively set Draft participants & round
WITH draftMatches AS (SELECT
        draftId AS id,
        array_agg(DISTINCT playerId::UUID) AS players
    FROM match@draft_idx, unnest(players) AS playerId
    GROUP BY draftId)
UPDATE draft SET (players, roundActive) = 
    (draftMatches.players, IF(draft.title = 'KLD', 4, 1))
    FROM draftMatches WHERE draft.id = draftMatches.id;

-- Set records for testing
UPDATE match SET (wins,draws,reported) =
    ('{0,1,0,0}'::SMALLINT[], 0, TRUE)
WHERE draftId = (SELECT id FROM draft WHERE title = 'CPY');

UPDATE match SET (wins,draws,reported) = (
    IF(round = 3, ('{0,0}'), ('{0,2}')),
    IF(round = 3 OR round = 4, 0, 1),
    IF(round = 4, FALSE, TRUE)
)
WHERE draftId = (SELECT id FROM draft WHERE title = 'KLD') 
AND round != 4;
