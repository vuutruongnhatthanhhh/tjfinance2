export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
}

export interface IncomeCategory {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
}

export interface ExpenseEntry {
  id: string;
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string;
  description: string | null;
  amount: number;
  createdAt: string;
}

export interface IncomeEntry {
  id: string;
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string;
  description: string | null;
  amount: number;
  createdAt: string;
}

export interface Investment {
  id: string;
  name: string;
  note: string | null;
  balance: number;
  totalDeposit: number;
  totalWithdraw: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentTransaction {
  id: string;
  investmentId: string;
  type: "deposit" | "withdraw";
  amount: number;
  note: string | null;
  createdAt: string;
}

export interface CategoryBreakdown {
  categoryId: string | null;
  name: string;
  icon: string;
  total: number;
}

export interface StatsSummary {
  totalIncome: number;
  totalExpense: number;
  remaining: number;
  expenseByCategory: CategoryBreakdown[];
  incomeByCategory: CategoryBreakdown[];
}
