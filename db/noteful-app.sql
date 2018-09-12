
-- --SELECT CURRENT_DATE;

DROP TABLE IF EXISTS folders;

CREATE TABLE folders (
    id serial PRIMARY KEY,
    name text NOT NULL
);

ALTER SEQUENCE folders_id_seq RESTART WITH 100;

INSERT INTO folders (name) VALUES
  ('Archive'),
  ('Drafts'),
  ('Personal'),
  ('Work');

SELECT * FROM folders LIMIT 5;

DROP TABLE IF EXISTS notes;

CREATE TABLE notes(
  id SERIAL PRIMARY KEY,
  title text NOT NULL,
  content text,
  created TIMESTAMP default current_timestamp,
  folder_id int REFERENCES folders(id) ON DELETE SET NULL
);

ALTER SEQUENCE notes_id_seq RESTART WITH 1000;

INSERT INTO notes
  (title, content, folder_id) VALUES
     ('title', 'content', 100)RETURNING id, title, content, folder_id, created;


SELECT * FROM notes LIMIT 5;

