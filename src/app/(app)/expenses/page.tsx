"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import Modal from "@/components/Modal";
import Skeleton from "@/components/Skeleton";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { ExpenseCategory, ExpenseEntry, IncomeCategory, IncomeEntry } from "@/lib/types";

type Kind = "expense" | "income";

interface Item {
  id: string;
  kind: Kind;
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string;
  description: string | null;
  amount: number;
  createdAt: string;
}

function toItems(kind: Kind, entries: (ExpenseEntry | IncomeEntry)[]): Item[] {
  return entries.map((e) => ({
    id: e.id,
    kind,
    categoryId: e.categoryId,
    categoryName: e.categoryName,
    categoryIcon: e.categoryIcon,
    description: e.description,
    amount: e.amount,
    createdAt: e.createdAt,
  }));
}

export default function ExpensesPage() {
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[] | null>(null);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[] | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formType, setFormType] = useState<Kind>("expense");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [filter, setFilter] = useState<"all" | Kind>("all");

  async function loadAll() {
    try {
      const [expCatRes, incCatRes, expRes, incRes] = await Promise.all([
        fetch("/api/categories/expense").then((r) => r.json()),
        fetch("/api/categories/income").then((r) => r.json()),
        fetch("/api/expenses").then((r) => r.json()),
        fetch("/api/incomes").then((r) => r.json()),
      ]);
      setExpenseCategories(expCatRes.categories ?? []);
      setIncomeCategories(incCatRes.categories ?? []);
      const merged = [
        ...toItems("expense", expRes.expenses ?? []),
        ...toItems("income", incRes.incomes ?? []),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setItems(merged);
    } catch {
      setError("Không tải được dữ liệu chi tiêu / thu nhập.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
  }, []);

  const categories = formType === "expense" ? expenseCategories : incomeCategories;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!editingId) setCategoryId("");
  }, [formType, editingId]);

  function openAdd(kind: Kind) {
    setEditingId(null);
    setFormType(kind);
    setCategoryId("");
    setDescription("");
    setAmount("");
    setFormError(null);
    setModalOpen(true);
  }

  function startEdit(item: Item) {
    setEditingId(item.id);
    setFormType(item.kind);
    setCategoryId(item.categoryId ?? "");
    setDescription(item.description ?? "");
    setAmount(String(item.amount));
    setFormError(null);
    setModalOpen(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setCategoryId("");
    setDescription("");
    setAmount("");
    setFormError(null);
    setModalOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setFormError("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setSubmitting(true);
    const base = formType === "expense" ? "/api/expenses" : "/api/incomes";
    const url = editingId ? `${base}/${editingId}` : base;
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: categoryId || null,
        description: description.trim() || null,
        amount: amountNum,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setFormError(data.error ?? "Có lỗi xảy ra, vui lòng thử lại");
      return;
    }

    cancelEdit();
    loadAll();
  }

  async function handleDelete(item: Item) {
    const base = item.kind === "expense" ? "/api/expenses" : "/api/incomes";
    await fetch(`${base}/${item.id}`, { method: "DELETE" });
    if (editingId === item.id) cancelEdit();
    loadAll();
  }

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (filter === "all") return items;
    return items.filter((i) => i.kind === filter);
  }, [items, filter]);

  const loading = expenseCategories === null || incomeCategories === null || items === null;

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 md:mx-auto md:max-w-3xl md:px-10 md:pt-10">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text-muted">Sổ giao dịch</p>
          <h1 className="font-display text-2xl font-bold text-text">Chi tiêu & Thu nhập</h1>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => openAdd("expense")}
            className="rounded-2xl bg-linear-to-br from-expense to-expense-dark px-3 py-2.5 text-sm font-display font-bold text-[#2a0a10] shadow-lg shadow-expense/30"
          >
            + Chi tiêu
          </button>
          <button
            onClick={() => openAdd("income")}
            className="rounded-2xl bg-linear-to-br from-income to-income-dark px-3 py-2.5 text-sm font-display font-bold text-[#06231f] shadow-lg shadow-income/30"
          >
            + Thu nhập
          </button>
        </div>
      </header>

      {error && <p className="rounded-2xl bg-expense/15 px-4 py-3 text-sm text-expense-soft">{error}</p>}

      <Modal
        open={modalOpen}
        onClose={cancelEdit}
        title={editingId ? "Sửa giao dịch" : formType === "expense" ? "Thêm chi tiêu" : "Thêm thu nhập"}
      >
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => !editingId && setFormType("expense")}
              disabled={!!editingId}
              className={clsx(
                "flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors",
                formType === "expense" ? "bg-expense/20 text-expense-soft" : "bg-background text-text-faint"
              )}
            >
              💸 Chi tiêu
            </button>
            <button
              type="button"
              onClick={() => !editingId && setFormType("income")}
              disabled={!!editingId}
              className={clsx(
                "flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors",
                formType === "income" ? "bg-income/20 text-income-soft" : "bg-background text-text-faint"
              )}
            >
              💰 Thu nhập
            </button>
          </div>

          {formError && <div className="rounded-xl bg-expense/15 px-3 py-2 text-sm text-expense-soft">{formError}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-text">Danh mục</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="rounded-xl bg-background px-4 py-3 text-base text-text ring-1 ring-border"
              >
                <option value="">Chưa phân loại</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-text">Diễn giải (không bắt buộc)</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Ăn trưa với đồng nghiệp"
                className="rounded-xl bg-background px-4 py-3 text-base text-text ring-1 ring-border placeholder:text-text-faint"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-text">Số tiền (₫)</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1000}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
                className="rounded-xl bg-background px-4 py-3 text-base text-text ring-1 ring-border placeholder:text-text-faint"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className={clsx(
                  "flex-1 rounded-2xl py-3 font-display font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-60",
                  formType === "expense"
                    ? "bg-linear-to-br from-expense to-expense-dark text-[#2a0a10] shadow-expense/30"
                    : "bg-linear-to-br from-income to-income-dark text-[#06231f] shadow-income/30"
                )}
              >
                {submitting ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "+ Thêm"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-2xl bg-background px-4 py-3 text-sm font-bold text-text-muted ring-1 ring-border"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <section className="flex flex-col gap-3">
        <div className="flex gap-2">
          {(["all", "expense", "income"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
                filter === f ? "bg-primary/20 text-primary-soft" : "bg-surface text-text-faint ring-1 ring-border"
              )}
            >
              {f === "all" ? "Tất cả" : f === "expense" ? "Chi tiêu" : "Thu nhập"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface p-8 text-center ring-1 ring-border">
            <p className="text-3xl">🧾</p>
            <p className="font-display font-bold text-text">Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 rounded-3xl bg-surface p-2 ring-1 ring-border">
            {filteredItems.map((item) => (
              <div key={`${item.kind}-${item.id}`} className="flex items-center gap-3 rounded-2xl px-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-lg">
                  {item.categoryIcon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">{item.description || item.categoryName}</p>
                  <p className="text-xs text-text-faint">
                    {item.categoryName} · {formatDateTime(item.createdAt)}
                  </p>
                </div>
                <p
                  className={clsx(
                    "shrink-0 text-sm font-bold",
                    item.kind === "income" ? "text-income-soft" : "text-expense-soft"
                  )}
                >
                  {item.kind === "income" ? "+" : "-"}
                  {formatCurrency(item.amount)}
                </p>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => startEdit(item)}
                    aria-label="Sửa"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-text-faint hover:text-text-muted"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    aria-label="Xoá"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-text-faint hover:text-expense-soft"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
