"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import Skeleton from "@/components/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { toInputDate } from "@/lib/date";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { ExpenseEntry, IncomeEntry, Investment, StatsSummary } from "@/lib/types";

type Transaction = {
  id: string;
  kind: "expense" | "income";
  icon: string;
  name: string;
  description: string | null;
  amount: number;
  createdAt: string;
};

export default function DashboardPage() {
  const [name, setName] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [investments, setInvestments] = useState<Investment[] | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const fullName = data.user?.user_metadata?.full_name as string | undefined;
      setName(fullName || data.user?.email || "bạn");
    });

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const from = toInputDate(new Date(now.getFullYear(), now.getMonth(), 1));
    const to = toInputDate(now);

    Promise.all([
      fetch(`/api/stats?mode=month&month=${month}`).then((r) => r.json()),
      fetch("/api/investments").then((r) => r.json()),
      fetch(`/api/expenses?from=${from}&to=${to}`).then((r) => r.json()),
      fetch(`/api/incomes?from=${from}&to=${to}`).then((r) => r.json()),
    ])
      .then(([statsRes, investmentsRes, expensesRes, incomesRes]) => {
        setStats(statsRes.stats);
        setInvestments(investmentsRes.investments ?? []);

        const expenseTx: Transaction[] = ((expensesRes.expenses ?? []) as ExpenseEntry[]).map((e) => ({
          id: `expense-${e.id}`,
          kind: "expense",
          icon: e.categoryIcon,
          name: e.categoryName,
          description: e.description,
          amount: e.amount,
          createdAt: e.createdAt,
        }));
        const incomeTx: Transaction[] = ((incomesRes.incomes ?? []) as IncomeEntry[]).map((i) => ({
          id: `income-${i.id}`,
          kind: "income",
          icon: i.categoryIcon,
          name: i.categoryName,
          description: i.description,
          amount: i.amount,
          createdAt: i.createdAt,
        }));
        const merged = [...expenseTx, ...incomeTx]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6);
        setTransactions(merged);
      })
      .catch(() => setError("Không tải được dữ liệu tổng quan."));
  }, []);

  const loading = stats === null || investments === null || transactions === null;
  const investTotal = investments?.reduce((sum, inv) => sum + inv.balance, 0) ?? 0;

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 md:mx-auto md:max-w-5xl md:px-10 md:pt-10">
      <header>
        <p className="text-sm font-medium text-text-muted">Chào, {name ?? "..."}</p>
        <h1 className="font-display text-2xl font-bold text-text">Tổng quan tài chính</h1>
      </header>

      {error && <p className="rounded-2xl bg-expense/15 px-4 py-3 text-sm text-expense-soft">{error}</p>}

      {loading && !error ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryCard label="Thu nhập tháng này" value={stats!.totalIncome} icon="💰" tone="income" />
            <SummaryCard label="Chi tiêu tháng này" value={stats!.totalExpense} icon="💸" tone="expense" />
            <SummaryCard
              label="Còn lại"
              value={stats!.remaining}
              icon={stats!.remaining >= 0 ? "✅" : "⚠️"}
              tone={stats!.remaining >= 0 ? "income" : "expense"}
            />
          </div>

          <Link
            href="/investments"
            className="flex items-center justify-between rounded-3xl bg-surface p-5 ring-1 ring-border transition-colors hover:bg-surface-elevated"
          >
            <div>
              <p className="text-sm text-text-muted">Tổng giá trị đầu tư</p>
              <p className="font-display text-xl font-bold text-invest-soft">{formatCurrency(investTotal)}</p>
              <p className="mt-1 text-xs text-text-faint">{investments!.length} khoản đầu tư</p>
            </div>
            <span className="text-2xl">📈</span>
          </Link>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm font-bold text-text-muted">Giao dịch gần đây</p>
              <Link href="/expenses" className="text-xs font-bold text-primary-soft">
                Xem tất cả
              </Link>
            </div>

            {transactions!.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface p-8 text-center ring-1 ring-border">
                <p className="text-3xl">🧾</p>
                <p className="font-display font-bold text-text">Chưa có giao dịch nào</p>
                <p className="text-sm text-text-muted">Bắt đầu ghi lại chi tiêu và thu nhập của bạn.</p>
                <Link
                  href="/expenses"
                  className="mt-2 rounded-full bg-linear-to-br from-primary to-primary-dark px-5 py-2.5 text-sm font-bold text-[#06231f] shadow-lg shadow-primary/30"
                >
                  Thêm giao dịch
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 rounded-3xl bg-surface p-2 ring-1 ring-border">
                {transactions!.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-2xl px-3 py-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-lg">
                      {t.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text">{t.description || t.name}</p>
                      <p className="text-xs text-text-faint">{formatDateTime(t.createdAt)}</p>
                    </div>
                    <p
                      className={clsx(
                        "shrink-0 text-sm font-bold",
                        t.kind === "income" ? "text-income-soft" : "text-expense-soft"
                      )}
                    >
                      {t.kind === "income" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: string;
  tone: "income" | "expense";
}) {
  return (
    <div className="flex flex-col gap-1 rounded-3xl bg-surface p-4 ring-1 ring-border">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={clsx("font-display text-lg font-bold", tone === "income" ? "text-income-soft" : "text-expense-soft")}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-3xl" />
        <Skeleton className="h-24 rounded-3xl" />
        <Skeleton className="h-24 rounded-3xl" />
      </div>
      <Skeleton className="h-20 rounded-3xl" />
      <Skeleton className="h-48 rounded-3xl" />
    </>
  );
}
