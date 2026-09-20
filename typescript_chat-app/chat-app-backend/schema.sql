-- ============================================================
--  Chat app schema (PostgreSQL)
--
--  Fresh install:
--    psql "postgresql://postgres:admin@localhost:5432/chatapp" -f schema.sql
--
--  Already have a database created by the earlier broadcast
--  version (messages without receiver_id)? Run the script in
--  migrations/001_add_receiver_id.sql instead.
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL UNIQUE,
  password   TEXT        NOT NULL,                  -- bcrypt hash
  is_online  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  sender_id   INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A conversation is always read as "(A -> B) OR (B -> A), oldest first".
CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages (sender_id, receiver_id, created_at);

CREATE INDEX IF NOT EXISTS idx_messages_receiver
  ON messages (receiver_id, created_at);
