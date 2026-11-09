-- Khoản đầu tư & log góp tiền / rút tiền của từng khoản, gắn với 1 user.

CREATE TABLE IF NOT EXISTS investments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investment_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw')),
  amount        NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS investments_user_idx ON investments (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS investment_transactions_investment_idx
  ON investment_transactions (investment_id, created_at DESC);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_investments" ON investments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_investments" ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_investments" ON investments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_investments" ON investments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "select_own_investment_transactions" ON investment_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_investment_transactions" ON investment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_investment_transactions" ON investment_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Giữ updated_at luôn mới sau mỗi lần sửa tên/ghi chú khoản đầu tư.
CREATE OR REPLACE FUNCTION set_investments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS investments_set_updated_at ON investments;
CREATE TRIGGER investments_set_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION set_investments_updated_at();
