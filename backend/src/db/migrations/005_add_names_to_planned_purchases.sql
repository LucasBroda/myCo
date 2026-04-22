-- Add card_name and set_name columns to planned_purchases table
ALTER TABLE planned_purchases
ADD COLUMN IF NOT EXISTS card_name TEXT,
ADD COLUMN IF NOT EXISTS set_name TEXT;

-- Optionally make card_id and set_id nullable if we want to transition fully to names
-- ALTER TABLE planned_purchases
-- ALTER COLUMN card_id DROP NOT NULL,
-- ALTER COLUMN set_id DROP NOT NULL;
