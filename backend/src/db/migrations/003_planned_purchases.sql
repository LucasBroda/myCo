CREATE TABLE IF NOT EXISTS planned_purchases (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id       TEXT        NOT NULL,
  set_id        TEXT        NOT NULL,
  planned_date  DATE        NOT NULL,
  budget        NUMERIC(10, 2),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_planned_purchases_user_id ON planned_purchases(user_id);
