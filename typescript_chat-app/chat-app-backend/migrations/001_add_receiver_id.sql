-- ============================================================
--  Migration: turn broadcast messages into direct messages.
--
--  Run this ONCE, only if your database still has the older
--  `messages` table that had no receiver_id column:
--
--    psql "postgresql://postgres:admin@localhost:5432/chatapp" \
--         -f migrations/001_add_receiver_id.sql
--
--  A brand new database does not need this file, it only
--  needs the root schema.sql.
-- ============================================================

BEGIN;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Old broadcast-era rows belong to nobody in particular, so they cannot be
-- kept as direct messages. If you would rather keep them, assign an owner
-- with an UPDATE before the DELETE below.
DELETE FROM messages WHERE receiver_id IS NULL;

ALTER TABLE messages
  ALTER COLUMN receiver_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages (sender_id, receiver_id, created_at);

CREATE INDEX IF NOT EXISTS idx_messages_receiver
  ON messages (receiver_id, created_at);

COMMIT;
