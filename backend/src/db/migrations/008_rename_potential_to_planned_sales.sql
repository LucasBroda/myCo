-- Rename potential_sales table to planned_sales
ALTER TABLE IF EXISTS potential_sales RENAME TO planned_sales;

-- Rename indexes
ALTER INDEX IF EXISTS idx_potential_sales_user_id RENAME TO idx_planned_sales_user_id;
ALTER INDEX IF EXISTS idx_potential_sales_card_id RENAME TO idx_planned_sales_card_id;
ALTER INDEX IF EXISTS idx_potential_sales_sale_date RENAME TO idx_planned_sales_sale_date;

-- Add completed field to track if sale is done
ALTER TABLE planned_sales ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Create index on completed status for faster filtering
CREATE INDEX IF NOT EXISTS idx_planned_sales_completed ON planned_sales(completed);
