import { createAdminClient } from "@/lib/supabase/admin";
import type { DateRange } from "@/lib/date";
import type { ExpenseEntry } from "@/lib/types";

interface ExpenseRow {
  id: string;
  category_id: string | null;
  description: string | null;
  amount: number;
  created_at: string;
  category: { name: string; icon: string } | null;
}

function mapExpense(row: ExpenseRow): ExpenseEntry {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category?.name ?? "Khác",
    categoryIcon: row.category?.icon ?? "🧾",
    description: row.description,
    amount: Number(row.amount),
    createdAt: row.created_at,
  };
}

export async function listExpenses(userId: string, range?: DateRange): Promise<ExpenseEntry[]> {
  const admin = createAdminClient();
  let query = admin
    .from("expenses")
    .select("id, category_id, description, amount, created_at, category:expense_categories(name, icon)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (range) {
    query = query.gte("created_at", range.from.toISOString()).lt("created_at", range.to.toISOString());
  }

  const { data, error } = await query;
  if (error) throw error;
  return ((data as unknown as ExpenseRow[] | null) ?? []).map(mapExpense);
}

export interface ExpenseInput {
  categoryId: string | null;
  description: string | null;
  amount: number;
}

export async function createExpense(userId: string, input: ExpenseInput): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("expenses").insert({
    user_id: userId,
    category_id: input.categoryId,
    description: input.description,
    amount: input.amount,
  });
  if (error) throw error;
}

export async function updateExpense(userId: string, id: string, input: ExpenseInput): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("expenses")
    .update({ category_id: input.categoryId, description: input.description, amount: input.amount })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteExpense(userId: string, id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("expenses").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}
