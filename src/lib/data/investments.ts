import { createAdminClient } from "@/lib/supabase/admin";
import type { Investment, InvestmentTransaction } from "@/lib/types";

interface InvestmentRow {
  id: string;
  name: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

interface TransactionRow {
  id: string;
  investment_id: string;
  type: "deposit" | "withdraw";
  amount: number;
  note: string | null;
  created_at: string;
}

function mapTransaction(row: TransactionRow): InvestmentTransaction {
  return {
    id: row.id,
    investmentId: row.investment_id,
    type: row.type,
    amount: Number(row.amount),
    note: row.note,
    createdAt: row.created_at,
  };
}

function withBalance(row: InvestmentRow, transactions: TransactionRow[]): Investment {
  const totalDeposit = transactions.filter((t) => t.type === "deposit").reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdraw = transactions.filter((t) => t.type === "withdraw").reduce((s, t) => s + Number(t.amount), 0);
  return {
    id: row.id,
    name: row.name,
    note: row.note,
    balance: totalDeposit - totalWithdraw,
    totalDeposit,
    totalWithdraw,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listInvestments(userId: string): Promise<Investment[]> {
  const admin = createAdminClient();
  const [{ data: investmentRows, error }, { data: transactionRows, error: txError }] = await Promise.all([
    admin.from("investments").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    admin.from("investment_transactions").select("*").eq("user_id", userId),
  ]);
  if (error) throw error;
  if (txError) throw txError;

  const byInvestment = new Map<string, TransactionRow[]>();
  for (const tx of (transactionRows as TransactionRow[] | null) ?? []) {
    const list = byInvestment.get(tx.investment_id) ?? [];
    list.push(tx);
    byInvestment.set(tx.investment_id, list);
  }

  return ((investmentRows as InvestmentRow[] | null) ?? []).map((row) =>
    withBalance(row, byInvestment.get(row.id) ?? [])
  );
}

export interface InvestmentInput {
  name: string;
  note: string | null;
}

export async function createInvestment(userId: string, input: InvestmentInput): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("investments")
    .insert({ user_id: userId, name: input.name, note: input.note })
    .select("id")
    .single();
  if (error || !data) throw error ?? new Error("Tạo khoản đầu tư thất bại");
  return data.id as string;
}

export async function updateInvestment(userId: string, id: string, input: InvestmentInput): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("investments")
    .update({ name: input.name, note: input.note })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteInvestment(userId: string, id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("investments").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export interface InvestmentDetail {
  investment: Investment;
  transactions: InvestmentTransaction[];
}

export async function getInvestmentDetail(userId: string, id: string): Promise<InvestmentDetail | null> {
  const admin = createAdminClient();
  const { data: investmentRow } = await admin
    .from("investments")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!investmentRow) return null;

  const { data: transactionRows, error } = await admin
    .from("investment_transactions")
    .select("*")
    .eq("investment_id", id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const transactions = (transactionRows as TransactionRow[] | null) ?? [];
  return {
    investment: withBalance(investmentRow as InvestmentRow, transactions),
    transactions: transactions.map(mapTransaction),
  };
}

export async function addInvestmentTransaction(
  userId: string,
  investmentId: string,
  type: "deposit" | "withdraw",
  amount: number,
  note: string | null
): Promise<void> {
  const admin = createAdminClient();
  const { data: investmentRow } = await admin
    .from("investments")
    .select("id")
    .eq("id", investmentId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!investmentRow) throw new Error("Không tìm thấy khoản đầu tư này");

  if (type === "withdraw") {
    const detail = await getInvestmentDetail(userId, investmentId);
    if (!detail || detail.investment.balance < amount) {
      throw new Error("Số dư khoản đầu tư không đủ để rút");
    }
  }

  const { error } = await admin.from("investment_transactions").insert({
    investment_id: investmentId,
    user_id: userId,
    type,
    amount,
    note,
  });
  if (error) throw error;
}

export async function deleteInvestmentTransaction(userId: string, transactionId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("investment_transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", userId);
  if (error) throw error;
}
