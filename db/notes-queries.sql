
SELECT * FROM notes;

SELECT * FROM notes LIMIT 5;

SELECT title FROM notes ORDER BY name ASC LIMIT 10;
SELECT title FROM notes ORDER BY id DESC LIMIT 10;
SELECT title FROM notes ORDER BY created DESC LIMIT 10;

--exact
select * FROM notes WHERE title LIKE 'cars' LIMIT 3;
--contains
select * FROM notes WHERE title LIKE '%car%' LIMIT 3;

UPDATE notes SET title = 'truck' WHERE content = '4x4';

INSERT INTO notes
  (title, content) VALUES
     ('title', '')RETURNING id, title, content, created;


DELETE FROM notes WHERE id = 1005;