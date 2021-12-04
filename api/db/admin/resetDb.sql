SET sql_safe_updates = FALSE;

USE defaultdb;
DROP DATABASE IF EXISTS lolretreat CASCADE;
COMMIT;

BEGIN;
SET sql_safe_updates = TRUE;
CREATE DATABASE IF NOT EXISTS lolretreat;

USE lolretreat;

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
    players UUID[] NOT NULL DEFAULT '{}',
    roundActive SMALLINT NOT NULL DEFAULT 0,
    roundCount SMALLINT NOT NULL DEFAULT 3,
    bestOf SMALLINT NOT NULL DEFAULT 3,
    playersPerMatch SMALLINT NOT NULL DEFAULT 2,

    -- Clock base (clockLimit set by user, others set by start/stop/etc)
    clockLimit INTERVAL NOT NULL DEFAULT '60 mins',
    clockStart TIMESTAMPTZ NULL,
    clockMod INTERVAL NULL,

    -- Index
    INDEX date_idx (day) STORING (title, roundActive, roundCount),
    INVERTED INDEX player_idx (players)
);

CREATE TABLE match (
    -- Base
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    draftId UUID REFERENCES draft(id) ON DELETE CASCADE,
    round SMALLINT NOT NULL,
    players JSON NOT NULL,
    draws SMALLINT NOT NULL DEFAULT 0,
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


-- FULL VIEWS --

CREATE VIEW team (id, name, members)
AS SELECT
    p.id, p.name,
    IF(
        p.isTeam,
        json_object(
            array_agg(mems.name),
            array_agg(mems.id)::STRING[]
        ), NULL
    )
FROM player@team_idx p
LEFT JOIN player mems
ON p.isTeam IS TRUE
AND mems.isTeam IS FALSE
AND p.members @> ARRAY[mems.id]
GROUP BY p.id;


CREATE VIEW allPlayers (id, players)
AS SELECT
    draftId,
    array_agg(DISTINCT player.id::UUID)
FROM match@draft_idx,
json_each_text(players) player(id,win)
GROUP BY draftId ORDER BY match.draftId;


CREATE VIEW draftClock (
    id, lim, mod,
    state, -- 1-index of: [on, off, paused]
    startMod, -- w/ modifier
    endTime
) AS SELECT
    -- Base info
    draft.id,
    draft.clockLimit,
    draft.clockMod,
    -- state
    (CASE WHEN draft.clockStart IS NOT NULL THEN 1
    WHEN draft.clockMod IS NULL THEN 2
    ELSE 3 END)::SMALLINT,
    -- startMod (w/ modifier)
    CASE WHEN draft.clockStart IS NULL THEN NULL
    WHEN draft.clockMod IS NULL THEN draft.clockStart
    ELSE draft.clockStart - draft.clockMod END,
    -- endTime
    CASE WHEN draft.clockStart IS NULL THEN NULL
    WHEN draft.clockMod IS NULL THEN draft.clockStart + draft.clockLimit
    ELSE draft.clockStart + draft.clockLimit - draft.clockMod END
FROM draft;


CREATE VIEW draftByes (draftId, players)
AS SELECT draftId, array_agg(byes.pids[1])
FROM match,
LATERAL (SELECT
    count(pid) pcount,
    array_agg(pid) pids
FROM json_object_keys(players) pid) byes
WHERE byes.pcount = 1
GROUP BY draftId;


CREATE VIEW draftDetails (
    id, players, playersPerMatch,
    roundActive, roundCount,
    canAdvance,
    byes
) AS SELECT
    draft.id, draft.players, playersPerMatch,
    roundActive, roundCount,
    bool_and(reported),
    draftByes.players
FROM draft
LEFT JOIN match ON draft.id = match.draftId
LEFT JOIN draftByes ON draft.id = draftByes.draftId
WHERE match.round = roundActive OR roundActive = 0
GROUP BY draft.id, draftByes.players;


CREATE VIEW matchDetail
	(id, maxWins, count, isBye, winners)
AS SELECT
    match.id,
    MAX(wins.maxm),
    MAX(wins.total) + draws,
    COUNT(player.id) = 1,
    -- Winners array
    IF(reported,
        array_agg(player.id)
            FILTER(WHERE player.win::SMALLINT = wins.maxm),
        NULL)
  
FROM match,
json_each_text(players) player(id,win),
LATERAL (SELECT
        MAX(value::SMALLINT) maxm,
        SUM(value::SMALLINT) total
    FROM jsonb_each_text(players)
) wins

GROUP BY match.id
ORDER BY match.id;


CREATE VIEW matchPlayer (
    playerId, matchId,
    wins,
    draws,
    count,
    isBye,
    result -- 1-Index in [W,L,D] or NULL if TBD
) AS SELECT
	player.id, match.id,
    MAX(win::SMALLINT),
    draws,
	MAX(count),
    EVERY(isBye),
    MIN(
        CASE WHEN isBye IS TRUE THEN 1::SMALLINT
        WHEN winners IS NULL THEN NULL
		WHEN array_length(winners,1) = 1 THEN
			(win::SMALLINT != maxWins)::SMALLINT + 1::SMALLINT
		ELSE 3::SMALLINT END
    )
FROM match
JOIN matchDetail USING(id),
jsonb_each_text(players) player(id, win)
GROUP BY match.id, player.id
ORDER BY match.id;


CREATE VIEW draftPlayer (
    playerId, draftId,
    matches,
    wins,
    draws,
    count
) AS SELECT
    matchPlayer.playerId, match.draftId,
    array_agg(match.id ORDER BY match.round),
    -- wins
    (COUNT(matchId)
        FILTER(WHERE matchPlayer.result = 1))::SMALLINT,
    -- draws
    (COUNT(matchId)
        FILTER(WHERE matchPlayer.result = 3))::SMALLINT,
    -- count
    (COUNT(match.id)
        FILTER(WHERE match.reported))::SMALLINT

FROM match@draft_idx
JOIN matchPlayer ON match.id = matchId
-- , jsonb_each_text(players) player(id, win)
GROUP BY match.draftId, playerId
ORDER BY match.draftId, playerId;


CREATE VIEW breakers (
    playerId, draftId, 
    matchWins,
    matchDraws,
    matchCount,
    gameWins,
    gameDraws,
    gameCount,
    oppIds
) AS SELECT
    playerId, draft.id,
    -- matchWins
    (COUNT(match.id)
    FILTER(WHERE isBye
        OR reported
        AND array_length(winners,1) = 1
        AND playerId = winners[1]::STRING))::SMALLINT,
    -- matchDraws
    (COUNT(match.id)
    FILTER(WHERE NOT isBye
        AND reported
        AND array_length(winners,1) != 1))::SMALLINT,
    -- matchCount
    (COUNT(match.id) FILTER(WHERE reported))::SMALLINT,

    -- gameWins
    SUM((match.players->>(playerId))::SMALLINT),
    -- gameDraws
    SUM(draws),
    -- gameCount
    SUM(count),
    -- oppIds
    array_agg(oppId)

FROM draft
JOIN (
    SELECT
        match.id id, draftId,
        reported, isBye,
        players, winners,
        draws, count
    FROM match JOIN matchDetail USING (id)
) match ON draftId = draft.id,
    json_object_keys(match.players) playerId,
    json_object_keys(match.players) oppId
    WHERE oppId != playerId
GROUP BY draft.id, playerId;

