---------------------------------
-- Update DB from v1 API to v2 --
---------------------------------

-- NOT FINALIZED --

-- Add Player Hiding --
-----------------------
ALTER TABLE player ADD COLUMN hide BOOL DEFAULT false;


-- Non-SQL Updates --
---------------------

