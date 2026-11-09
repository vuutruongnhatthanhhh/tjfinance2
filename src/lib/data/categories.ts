import { createAdminClient } from "@/lib/supabase/admin";
import type { ExpenseCategory, IncomeCategory } from "@/lib/types";

interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  created_at: string;
}

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Ăn uống", icon: "🍔" },
  { name: "Di chuyển", icon: "🚗" },
  { name: "Nhà ở", icon: "🏠" },
  { name: "Hóa đơn & tiện ích", icon: "💡" },
  { name: "Mua sắm", icon: "🛍️" },
  { name: "Giải trí", icon: "🎮" },
  { name: "Sức khỏe", icon: "💊" },
  { name: "Giáo dục", icon: "📚" },
  { name: "Khác", icon: "🧾" },
];

const DEFAULT_INCOME_CATEGORIES = [
  { name: "Lương", icon: "💼" },
  { name: "Thưởng", icon: "🎁" },
  { name: "Thu nhập phụ", icon: "🧰" },
  { name: "Khác", icon: "💰" },
];

function mapCategory(row: CategoryRow): ExpenseCategory {
  return { id: row.id, name: row.name, icon: row.icon, createdAt: row.created_at };
}

export async function listExpenseCategories(userId: string): Promise<ExpenseCategory[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("expense_categories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  if (!data || data.length === 0) {
    const { data: seeded, error: seedError } = await admin
      .from("expense_categories")
      .insert(DEFAULT_EXPENSE_CATEGORIES.map((c) => ({ ...c, user_id: userId })))
      .select("*");
    if (seedError) throw seedError;
    return ((seeded as CategoryRow[] | null) ?? []).map(mapCategory);
  }

  return (data as CategoryRow[]).map(mapCategory);
}

export async function listIncomeCategories(userId: string): Promise<IncomeCategory[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("income_categories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  if (!data || data.length === 0) {
    const { data: seeded, error: seedError } = await admin
      .from("income_categories")
      .insert(DEFAULT_INCOME_CATEGORIES.map((c) => ({ ...c, user_id: userId })))
      .select("*");
    if (seedError) throw seedError;
    return ((seeded as CategoryRow[] | null) ?? []).map(mapCategory);
  }

  return (data as CategoryRow[]).map(mapCategory);
}

export interface CategoryInput {
  name: string;
  icon: string;
}

export async function createExpenseCategory(userId: string, input: CategoryInput): Promise<ExpenseCategory> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("expense_categories")
    .insert({ user_id: userId, name: input.name, icon: input.icon })
    .select("*")
    .single();
  if (error) throw error;
  return mapCategory(data as CategoryRow);
}

export async function createIncomeCategory(userId: string, input: CategoryInput): Promise<IncomeCategory> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("income_categories")
    .insert({ user_id: userId, name: input.name, icon: input.icon })
    .select("*")
    .single();
  if (error) throw error;
  return mapCategory(data as CategoryRow);
}

export async function updateExpenseCategory(userId: string, id: string, input: CategoryInput): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("expense_categories")
    .update({ name: input.name, icon: input.icon })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function updateIncomeCategory(userId: string, id: string, input: CategoryInput): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("income_categories")
    .update({ name: input.name, icon: input.icon })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteExpenseCategory(userId: string, id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("expense_categories").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function deleteIncomeCategory(userId: string, id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("income_categories").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}
