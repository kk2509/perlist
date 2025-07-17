-- CREATE TABLE items (
--   id SERIAL PRIMARY KEY,
--   title VARCHAR(100) NOT NULL
-- );

-- INSERT INTO items (title) VALUES ('Buy milk'), ('Finish homework');

-- Create members table
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- Create items table
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  member_id INTEGER REFERENCES members(id)
);

INSERT INTO members (name) VALUES ('Mom'), ('Dad'), ('Child1'), ('Child2');
