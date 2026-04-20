CREATE TABLE IF NOT EXISTS followed_sets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  set_id      TEXT        NOT NULL,
  followed_at TIMESTAMPTZ DEFAULT now(),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, set_id)
);

CREATE INDEX IF NOT EXISTS idx_followed_sets_user_id ON followed_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_followed_sets_set_id ON followed_sets(set_id);
