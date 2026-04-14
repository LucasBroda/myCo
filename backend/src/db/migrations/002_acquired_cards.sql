CREATE TABLE IF NOT EXISTS acquired_cards (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id       TEXT        NOT NULL,
  set_id        TEXT        NOT NULL,
  acquired_date DATE        NOT NULL,
  price_paid    NUMERIC(10, 2),
  condition     TEXT        NOT NULL CHECK (condition IN ('Mint','NM','LP','MP','HP','Damaged')),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acquired_cards_user_id ON acquired_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_acquired_cards_set_id  ON acquired_cards(set_id);
