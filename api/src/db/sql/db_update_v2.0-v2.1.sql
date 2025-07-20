-------------------------------------
-- Update DB from v2.0 API to v2.1 --
-------------------------------------

-- NOTE: These are backwards compatible

-- Change PLAN value to index in EVENTS --
-------------------------------------------
-- Add/Seed the new index column
ALTER TABLE "event" ADD COLUMN planidx SMALLINT DEFAULT 0;
WITH seed AS (
  SELECT id, row_number() OVER (ORDER BY id) AS idx
  FROM "event" WHERE plan
)
UPDATE "event" SET planidx = seed.idx
FROM seed WHERE "event".id = seed.id;

-- Replace old column
ALTER TABLE "event" DROP COLUMN plan;
ALTER TABLE "event" RENAME COLUMN planidx TO plan;


-- Add index column to VOTERS --
--------------------------------
ALTER TABLE "voter" ADD COLUMN idx SMALLINT DEFAULT 0;

WITH seed AS (
  SELECT id, row_number() OVER (ORDER BY id) AS idx
  FROM "voter"
)
UPDATE "voter" SET idx = seed.idx
FROM seed WHERE "voter".id = seed.id;

-- Add UPSERT action to LOG --
------------------------------
ALTER TYPE log_action ADD VALUE 'upsert';

-- Update DB version Number --
------------------------------
UPSERT INTO settings (id, value) VALUES ('dbversion', '2.1.0');


-- Non-SQL Updates --
---------------------
-- NOTE: This upgrade will break all passwords! To prepare do one of the following:
--  1) Sign in as a Gonti user before deployment so your session is remembered
--     and you can reset your password to not lose access.
--  2) Use the below SQL directly on the DB to remove any Gontis (player.access = 3),
--     then use the new http://[domain]/setup endpoint to create a new Gonti user.
--       > UPDATE player SET "access" = 2 WHERE "access" = 3;
