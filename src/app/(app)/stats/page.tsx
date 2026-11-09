"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import Skeleton from "@/components/Skeleton";
import { toInputDate } from "@/lib/date";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CategoryBreakdown, StatsSummary } from "@/lib/types";

type Mode = "month" | "year" | "custom";

function monthInputValue(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function StatsPage() {
  const now = useMemo(() => new Date(), []);
  const [mode, setMode] = useState<Mode>("month");
  const [month, setMonth] = useState(monthInputValue(now));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [from, setFrom] = useState(toInputDate(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = useState(toInputDate(now));

  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStats(null);
    setError(null);

    const params = new URLSearchParams({ mode });
    if (mode === "month") params.set("month", month);
    if (mode === "year") params.set("year", year);
    if (mode === "custom") {
      params.set("from", from);
      params.set("to", to);
    }

    fetch(`/api/stats?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStats(data.stats);
      })
      .catch(() => setError("Không tải được thống kê cho khoảng thời gian này."));
  }, [mode, month, year, from, to]);

  const rangeLabel =
    mode === "month"
      ? `Tháng ${Number(month.split("-")[1])}/${month.split("-")[0]}`
      : mode === "year"
      ? `Năm ${year}`
      : `${formatDate(`${from}T00:00:00`)} - ${formatDate(`${to}T00:00:00`)}`;

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 md:mx-auto md:max-w-3xl md:px-10 md:pt-10">
      <header>
        <p className="text-sm font-medium text-text-muted">Phân tích</p>
        <h1 className="font-display text-2xl font-bold text-text">Thống kê</h1>
      </header>

      <div className="flex flex-col gap-4 rounded-3xl bg-surface p-5 ring-1 ring-border">
        <div className="flex gap-2">
          {(["month", "year", "custom"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={clsx(
                "flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors",
                mode === m ? "bg-primary/20 text-primary-soft" : "bg-background text-text-faint"
              )}
            >
              {m === "month" ? "Theo tháng" : m === "year" ? "Theo năm" : "Tùy chọn"}
            </button>
          ))}
        </div>

        {mode === "month" && (
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-xl bg-background px-4 py-3 text-base text-text ring-1 ring-border"
          />
        )}
        {mode === "year" && (
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min={2000}
            max={2100}
            className="rounded-xl bg-background px-4 py-3 text-base text-text ring-1 ring-border"
          />
        )}
        {mode === "custom" && (
          <div className="flex gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="flex-1 rounded-xl bg-background px-4 py-3 text-base text-text ring-1 ring-border"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="flex-1 rounded-xl bg-background px-4 py-3 text-base text-text ring-1 ring-border"
            />
          </div>
        )}

        <p className="text-center text-xs text-text-faint">{rangeLabel}</p>
      </div>

      {error && <p className="rounded-2xl bg-expense/15 px-4 py-3 text-sm text-expense-soft">{error}</p>}

      {!stats && !error ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryCard label="Thu nhập" value={stats.totalIncome} tone="income" />
            <SummaryCard label="Chi tiêu" value={stats.totalExpense} tone="expense" />
            <SummaryCard label="Còn lại" value={stats.remaining} tone={stats.remaining >= 0 ? "income" : "expense"} />
          </div>

          <BreakdownSection title="Chi tiêu theo danh mục" items={stats.expenseByCategory} tone="expense" />
          <BreakdownSection title="Thu nhập theo danh mục" items={stats.incomeByCategory} tone="income" />
        </>
      ) : null}
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "income" | "expense" }) {
  return (
    <div className="flex flex-col gap-1 rounded-3xl bg-surface p-4 ring-1 ring-border">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={clsx("font-display text-lg font-bold", tone === "income" ? "text-income-soft" : "text-expense-soft")}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function BreakdownSection({
  title,
  items,
  tone,
}: {
  title: string;
  items: CategoryBreakdown[];
  tone: "income" | "expense";
}) {
  const total = items.reduce((s, i) => s + i.total, 0);
  const max = items.reduce((m, i) => Math.max(m, i.total), 0);

  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-surface p-5 ring-1 ring-border">
      <p className="font-display text-sm font-bold text-text">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-text-faint">Không có dữ liệu trong khoảng thời gian này.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const pct = total > 0 ? Math.round((item.total / total) * 100) : 0;
            const width = max > 0 ? Math.max(4, (item.total / max) * 100) : 0;
            return (
              <div key={item.categoryId ?? "none"} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-semibold text-text">
                    <span>{item.icon}</span>
                    {item.name}
                  </span>
                  <span className="text-text-muted">
                    {formatCurrency(item.total)} · {pct}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-background">
                  <div
                    className={clsx("h-full rounded-full", tone === "income" ? "bg-income" : "bg-expense")}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
