USE lolretreat;

SET sql_safe_updates = FALSE;
DELETE FROM draft *;
DELETE FROM match *;
DELETE FROM player *;
SET sql_safe_updates = TRUE;

INSERT INTO player (name) VALUES
    ('Nick'), ('Matt'), ('Cosme'), ('Taylor'),
    ('Ian'),  ('Foff'), ('Stack'), ('Henry');

INSERT INTO draft (title, day) VALUES
    ('AKH',  '2020-10-07'),
    ('KLD',  '2020-10-05'),
    ('Cube', '2020-10-07');

INSERT INTO match (draft, round, players) VALUES
    ((SELECT id from draft WHERE title='AKH'), 1, (ARRAY[
        (SELECT id from player WHERE name='Nick'), (SELECT id from player WHERE name='Ian'),
        (SELECT id from player WHERE name='Matt'), (SELECT id from player WHERE name='Foff')
    ])),
    ((SELECT id from draft WHERE title='AKH'), 1, (ARRAY[
        (SELECT id from player WHERE name='Cosme'), (SELECT id from player WHERE name='Stack'),
        (SELECT id from player WHERE name='Taylor'), (SELECT id from player WHERE name='Henry')
    ]));
INSERT INTO match (draft, round, players) VALUES
    ((SELECT id from draft WHERE title='KLD'), 1, (ARRAY[(SELECT id from player WHERE name='Nick'), (SELECT id from player WHERE name='Ian')])),
    ((SELECT id from draft WHERE title='KLD'), 1, (ARRAY[(SELECT id from player WHERE name='Matt'), (SELECT id from player WHERE name='Foff')])),
    ((SELECT id from draft WHERE title='KLD'), 1, (ARRAY[(SELECT id from player WHERE name='Cosme'), (SELECT id from player WHERE name='Stack')])),
    ((SELECT id from draft WHERE title='KLD'), 1, (ARRAY[(SELECT id from player WHERE name='Taylor'), (SELECT id from player WHERE name='Henry')]));
INSERT INTO match (draft, round, players) VALUES
    ((SELECT id from draft WHERE title='KLD'), 2, (ARRAY[(SELECT id from player WHERE name='Nick'), (SELECT id from player WHERE name='Matt')])),
    ((SELECT id from draft WHERE title='KLD'), 2, (ARRAY[(SELECT id from player WHERE name='Ian'), (SELECT id from player WHERE name='Foff')])),
    ((SELECT id from draft WHERE title='KLD'), 2, (ARRAY[(SELECT id from player WHERE name='Cosme'), (SELECT id from player WHERE name='Taylor')])),
    ((SELECT id from draft WHERE title='KLD'), 2, (ARRAY[(SELECT id from player WHERE name='Stack'), (SELECT id from player WHERE name='Henry')]));
INSERT INTO match (draft, round, players) VALUES
    ((SELECT id from draft WHERE title='KLD'), 3, (ARRAY[(SELECT id from player WHERE name='Nick'), (SELECT id from player WHERE name='Foff')])),
    ((SELECT id from draft WHERE title='KLD'), 3, (ARRAY[(SELECT id from player WHERE name='Matt'), (SELECT id from player WHERE name='Stack')])),
    ((SELECT id from draft WHERE title='KLD'), 3, (ARRAY[(SELECT id from player WHERE name='Cosme'), (SELECT id from player WHERE name='Henry')])),
    ((SELECT id from draft WHERE title='KLD'), 3, (ARRAY[(SELECT id from player WHERE name='Taylor'), (SELECT id from player WHERE name='Ian')]));
INSERT INTO match (draft, round, players) VALUES
    ((SELECT id from draft WHERE title='Cube'), 1, (ARRAY[(SELECT id from player WHERE name='Nick'), (SELECT id from player WHERE name='Ian')])),
    ((SELECT id from draft WHERE title='Cube'), 1, (ARRAY[(SELECT id from player WHERE name='Matt'), (SELECT id from player WHERE name='Foff')])),
    ((SELECT id from draft WHERE title='Cube'), 1, (ARRAY[(SELECT id from player WHERE name='Cosme'), (SELECT id from player WHERE name='Stack')])),
    ((SELECT id from draft WHERE title='Cube'), 1, (ARRAY[(SELECT id from player WHERE name='Taylor'), (SELECT id from player WHERE name='Henry')]));
INSERT INTO match (draft, round, players) VALUES
    ((SELECT id from draft WHERE title='Cube'), 2, (ARRAY[(SELECT id from player WHERE name='Matt'), (SELECT id from player WHERE name='Ian')])),
    ((SELECT id from draft WHERE title='Cube'), 2, (ARRAY[(SELECT id from player WHERE name='Nick'), (SELECT id from player WHERE name='Foff')])),
    ((SELECT id from draft WHERE title='Cube'), 2, (ARRAY[(SELECT id from player WHERE name='Taylor'), (SELECT id from player WHERE name='Stack')])),
    ((SELECT id from draft WHERE title='Cube'), 2, (ARRAY[(SELECT id from player WHERE name='Cosme'), (SELECT id from player WHERE name='Henry')]));


SELECT * FROM draft ORDER BY INDEX draft@date_idx;
SELECT * FROM player ORDER BY INDEX player@team_idx;
SELECT * FROM match ORDER BY INDEX match@draft_idx;
