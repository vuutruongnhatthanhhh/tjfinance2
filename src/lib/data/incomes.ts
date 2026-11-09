import { createAdminClient } from "@/lib/supabase/admin";
import type { DateRange } from "@/lib/date";
import type { IncomeEntry } from "@/lib/types";

interface IncomeRow {
  id: string;
  category_id: string | null;
  description: string | null;
  amount: number;
  created_at: string;
  category: { name: string; icon: string } | null;
}

function mapIncome(row: IncomeRow): IncomeEntry {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category?.name ?? "Khác",
    categoryIcon: row.category?.icon ?? "💰",
    description: row.description,
    amount: Number(row.amount),
    createdAt: row.created_at,
  };
}

export async function listIncomes(userId: string, range?: DateRange): Promise<IncomeEntry[]> {
  const admin = createAdminClient();
  let query = admin
    .from("incomes")
    .select("id, category_id, description, amount, created_at, category:income_categories(name, icon)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (range) {
    query = query.gte("created_at", range.from.toISOString()).lt("created_at", range.to.toISOString());
  }

  const { data, error } = await query;
  if (error) throw error;
  return ((data as unknown as IncomeRow[] | null) ?? []).map(mapIncome);
}

export interface IncomeInput {
  categoryId: string | null;
  description: string | null;
  amount: number;
}

export async function createIncome(userId: string, input: IncomeInput): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("incomes").insert({
    user_id: userId,
    category_id: input.categoryId,
    description: input.description,
    amount: input.amount,
  });
  if (error) throw error;
}

export async function updateIncome(userId: string, id: string, input: IncomeInput): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("incomes")
    .update({ category_id: input.categoryId, description: input.description, amount: input.amount })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteIncome(userId: string, id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("incomes").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}
