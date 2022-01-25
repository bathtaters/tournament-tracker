SET sql_safe_updates = FALSE;

USE defaultdb;
DROP DATABASE IF EXISTS lolretreat CASCADE;
COMMIT;

BEGIN;
SET sql_safe_updates = TRUE;
CREATE DATABASE IF NOT EXISTS lolretreat;

USE lolretreat;

CREATE TABLE settings (
    id STRING PRIMARY KEY NOT NULL,
    value STRING,
    type STRING NOT NULL DEFAULT 'string'
);

CREATE TABLE player (
    -- Base
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name STRING NULL,

    -- Team
    isTeam BOOLEAN NOT NULL DEFAULT FALSE,
    members UUID[] NULL,

    -- Index
    INDEX team_idx (isTeam) STORING (name, members),
    INVERTED INDEX member_idx (members) WHERE isTeam IS TRUE
);

CREATE TABLE draft (
    -- Base
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    title STRING NULL,
    day DATE NULL,
    slot SMALLINT NOT NULL DEFAULT 0,
    players UUID[] NOT NULL DEFAULT '{}',
    roundActive SMALLINT NOT NULL DEFAULT 0,
    roundCount SMALLINT NOT NULL DEFAULT 3,
    winCount SMALLINT NOT NULL DEFAULT 2,
    playersPerMatch SMALLINT NOT NULL DEFAULT 2,

    -- Clock base (clockLimit set by user, others set by start/stop/etc)
    clockLimit INTERVAL NOT NULL DEFAULT '60 mins',
    clockStart TIMESTAMPTZ NULL,
    clockMod INTERVAL NULL,

    -- Index
    INDEX date_idx (day) STORING (slot),
    INVERTED INDEX player_idx (players)
);

CREATE TABLE match (
    -- Base
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    draftId UUID REFERENCES draft(id) ON DELETE CASCADE,
    round SMALLINT NOT NULL,
    players UUID[] NOT NULL,
    wins SMALLINT[] NOT NULL,
    draws SMALLINT NOT NULL DEFAULT 0,
    drops UUID[] NOT NULL DEFAULT '{}',
    reported BOOLEAN NOT NULL DEFAULT FALSE,

    -- Indexes
    INDEX draft_idx (draftId, round) STORING (players, draws, reported),
    INVERTED INDEX player_idx (players)
);

-- Perms
GRANT ALL ON DATABASE lolretreat TO db_admin;
GRANT ALL ON TABLE * TO db_admin;
GRANT INSERT, UPDATE, DELETE, SELECT ON TABLE * TO db_rw;
GRANT SELECT ON TABLE * TO db_read;


-- COMBO VIEWS --

CREATE VIEW draftDetail (
    id, title, players, playersPerMatch,
    day, slot, roundActive, roundCount, winCount,
    canAdvance,
    byes,
    drops
) AS SELECT
    draft.id, draft.title, draft.players, playersPerMatch,
    day, slot, roundActive, roundCount, winCount,
    bool_and(reported),
    array_agg(match.players[1]) FILTER(WHERE array_length(match.players,1) = 1),
    json_agg(drops)
FROM draft
LEFT JOIN match ON draft.id = match.draftId
GROUP BY draft.id;


CREATE VIEW matchDetail (
    id, draftId, round, reported,
    draws, drops,
    maxWins, totalWins,
    players, wins
) AS SELECT
    match.id, draftId, round, reported,
    draws, drops,
    MAX(player.win), SUM(player.win),
    players, wins
FROM match, unnest(players,wins) player(id,win)
GROUP BY match.id ORDER BY match.id;


-- INVERTED INDEX QUERIES --

CREATE VIEW draftOpps (playerId, draftId, oppIds)
AS SELECT playerId, draftId, array_agg(oppId)
FROM match,
    unnest(match.players) playerId,
    unnest(match.players) oppId
WHERE oppId != playerId GROUP BY draftId, playerId;


CREATE VIEW schedule (day, draftSlots)
AS SELECT
    COALESCE(to_char(day), 'none'),
    json_object_agg(id::STRING, slot)
FROM draft@date_idx GROUP BY day;
