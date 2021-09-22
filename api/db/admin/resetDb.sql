SET sql_safe_updates = FALSE;

USE defaultdb;
DROP DATABASE IF EXISTS lolretreat CASCADE;
COMMIT;

BEGIN;
SET sql_safe_updates = TRUE;
CREATE DATABASE IF NOT EXISTS lolretreat;

USE lolretreat;

CREATE TABLE player (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name STRING NULL,
    isTeam BOOLEAN NOT NULL DEFAULT FALSE,
    members UUID[] NULL,
    teamList UUID[] NOT NULL DEFAULT '{}',
    matchList UUID[] NOT NULL DEFAULT '{}',
    INDEX team_idx (isTeam) STORING (name, members, teamList, matchList)
);

CREATE TABLE draft (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    title STRING NULL,
    day DATE NULL,
    players UUID[] NOT NULL DEFAULT '{}',
    roundActive SMALLINT NOT NULL DEFAULT -1,
    roundCount SMALLINT NOT NULL DEFAULT 3,
    bestOf SMALLINT NOT NULL DEFAULT 3,
    clockStart TIMESTAMPTZ NULL,
    clockLimit INT4 NOT NULL DEFAULT 3600,
    clockMod DECIMAL NOT NULL DEFAULT 0,
    INDEX date_idx (day) STORING (title, roundActive, roundCount)
);

CREATE TABLE match (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    draft UUID REFERENCES draft(id) ON DELETE CASCADE,
    round SMALLINT NOT NULL,
    players UUID[] NOT NULL,
    wins SMALLINT[] NOT NULL,
    draws SMALLINT NOT NULL DEFAULT 0,
    INDEX draft_idx (draft, round) STORING (players, wins, draws)
);

GRANT ALL ON DATABASE lolretreat TO db_admin;
GRANT ALL ON TABLE * TO db_admin;
GRANT INSERT, UPDATE, DELETE, SELECT ON TABLE * TO db_rw;
GRANT SELECT ON TABLE * TO db_read;
