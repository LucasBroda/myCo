CREATE TABLE IF NOT EXISTS potential_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id VARCHAR(255) NOT NULL,
    set_id VARCHAR(255) NOT NULL,
    sale_price NUMERIC(10, 2) NOT NULL,
    sale_date DATE NOT NULL,
    condition VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_potential_sales_user_id ON potential_sales(user_id);
CREATE INDEX IF NOT EXISTS idx_potential_sales_card_id ON potential_sales(card_id);
CREATE INDEX IF NOT EXISTS idx_potential_sales_sale_date ON potential_sales(sale_date);
