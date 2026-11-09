import type { DateRange } from "@/lib/date";
import { listExpenses } from "@/lib/data/expenses";
import { listIncomes } from "@/lib/data/incomes";
import type { CategoryBreakdown, StatsSummary } from "@/lib/types";

function breakdown(
  entries: { categoryId: string | null; categoryName: string; categoryIcon: string; amount: number }[]
): CategoryBreakdown[] {
  const map = new Map<string, CategoryBreakdown>();
  for (const entry of entries) {
    const key = entry.categoryId ?? "none";
    const existing = map.get(key);
    if (existing) {
      existing.total += entry.amount;
    } else {
      map.set(key, {
        categoryId: entry.categoryId,
        name: entry.categoryName,
        icon: entry.categoryIcon,
        total: entry.amount,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

export async function getStatsSummary(userId: string, range: DateRange): Promise<StatsSummary> {
  const [expenses, incomes] = await Promise.all([listExpenses(userId, range), listIncomes(userId, range)]);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  return {
    totalIncome,
    totalExpense,
    remaining: totalIncome - totalExpense,
    expenseByCategory: breakdown(expenses),
    incomeByCategory: breakdown(incomes),
  };
}
