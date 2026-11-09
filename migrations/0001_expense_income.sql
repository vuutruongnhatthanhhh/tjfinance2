-- Danh mục & giao dịch chi tiêu / thu nhập, mỗi dòng gắn với 1 user.
-- RLS đảm bảo mỗi user chỉ đọc/ghi được dữ liệu của chính mình.

CREATE TABLE IF NOT EXISTS expense_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  icon       TEXT NOT NULL DEFAULT '🧾',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS income_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  icon       TEXT NOT NULL DEFAULT '💰',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  description TEXT,
  amount      NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incomes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES income_categories(id) ON DELETE SET NULL,
  description TEXT,
  amount      NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS expenses_user_created_idx ON expenses (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS incomes_user_created_idx ON incomes (user_id, created_at DESC);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_expense_categories" ON expense_categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_expense_categories" ON expense_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_expense_categories" ON expense_categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_expense_categories" ON expense_categories
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "select_own_income_categories" ON income_categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_income_categories" ON income_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_income_categories" ON income_categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_income_categories" ON income_categories
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "select_own_expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "select_own_incomes" ON incomes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_incomes" ON incomes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_incomes" ON incomes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_incomes" ON incomes
  FOR DELETE USING (auth.uid() = user_id);
