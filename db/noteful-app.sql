
-- --SELECT CURRENT_DATE;

DROP TABLE IF EXISTS folders;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS tags;


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

CREATE TABLE tags (
    id serial PRIMARY KEY,
    name text NOT NULL
);

CREATE TABLE notes_tags (
  note_id INTEGER NOT NULL REFERENCES notes ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags ON DELETE CASCADE
);

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

INSERT INTO tags

INSERT INTO notes_tags
  (note_id, tag_id) VALUES
    (1005, 1), (1006, 2), (1007, 3)RETURNING note_id, tag_id;