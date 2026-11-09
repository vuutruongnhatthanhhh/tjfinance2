"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import Modal from "@/components/Modal";
import Skeleton from "@/components/Skeleton";
import { CATEGORY_ICONS } from "@/lib/icons";
import type { ExpenseCategory, IncomeCategory } from "@/lib/types";

type Kind = "expense" | "income";
type Category = ExpenseCategory | IncomeCategory;

export default function CategoriesPage() {
  const [tab, setTab] = useState<Kind>("expense");
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[] | null>(null);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [icon, setIcon] = useState("🧾");
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  async function loadAll() {
    try {
      const [expRes, incRes] = await Promise.all([
        fetch("/api/categories/expense").then((r) => r.json()),
        fetch("/api/categories/income").then((r) => r.json()),
      ]);
      setExpenseCategories(expRes.categories ?? []);
      setIncomeCategories(incRes.categories ?? []);
    } catch {
      setError("Không tải được danh mục.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
  }, []);

  useEffect(() => {
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  function resetForm() {
    setEditingId(null);
    setIcon(tab === "expense" ? "🧾" : "💰");
    setName("");
    setFormError(null);
    setModalOpen(false);
    setIconPickerOpen(false);
  }

  function openAdd() {
    resetForm();
    setModalOpen(true);
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setIcon(category.icon);
    setName(category.name);
    setFormError(null);
    setIconPickerOpen(false);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) {
      setFormError("Vui lòng nhập tên danh mục");
      return;
    }

    setSubmitting(true);
    const base = tab === "expense" ? "/api/categories/expense" : "/api/categories/income";
    const url = editingId ? `${base}/${editingId}` : base;
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), icon: icon.trim() || "🧾" }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setFormError(data.error ?? "Có lỗi xảy ra, vui lòng thử lại");
      return;
    }

    resetForm();
    loadAll();
  }

  async function handleDelete(category: Category) {
    const base = tab === "expense" ? "/api/categories/expense" : "/api/categories/income";
    await fetch(`${base}/${category.id}`, { method: "DELETE" });
    if (editingId === category.id) resetForm();
    loadAll();
  }

  const categories = tab === "expense" ? expenseCategories : incomeCategories;
  const loading = categories === null;

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 md:mx-auto md:max-w-2xl md:px-10 md:pt-10">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text-muted">Quản lý</p>
          <h1 className="font-display text-2xl font-bold text-text">Danh mục</h1>
        </div>
        <button
          onClick={openAdd}
          className="shrink-0 rounded-2xl bg-linear-to-br from-primary to-primary-dark px-4 py-2.5 text-sm font-display font-bold text-[#06231f] shadow-lg shadow-primary/30"
        >
          + Thêm
        </button>
      </header>

      {error && <p className="rounded-2xl bg-expense/15 px-4 py-3 text-sm text-expense-soft">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={() => setTab("expense")}
          className={clsx(
            "flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors",
            tab === "expense" ? "bg-expense/20 text-expense-soft" : "bg-surface text-text-faint ring-1 ring-border"
          )}
        >
          💸 Danh mục chi tiêu
        </button>
        <button
          onClick={() => setTab("income")}
          className={clsx(
            "flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors",
            tab === "income" ? "bg-income/20 text-income-soft" : "bg-surface text-text-faint ring-1 ring-border"
          )}
        >
          💰 Danh mục thu nhập
        </button>
      </div>

      <Modal open={modalOpen} onClose={resetForm} title={editingId ? "Sửa danh mục" : "Thêm danh mục"}>
        <div className="flex flex-col gap-4">
          {formError && <div className="rounded-xl bg-expense/15 px-3 py-2 text-sm text-expense-soft">{formError}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIconPickerOpen((v) => !v)}
                className="flex w-16 shrink-0 items-center justify-center rounded-xl bg-background py-3 text-xl ring-1 ring-border transition-colors hover:bg-surface-elevated"
                aria-label="Chọn biểu tượng"
              >
                {icon || "🧾"}
              </button>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên danh mục"
                required
                className="flex-1 rounded-xl bg-background px-4 py-3 text-base text-text ring-1 ring-border placeholder:text-text-faint"
              />
            </div>

            {iconPickerOpen && (
              <div className="grid grid-cols-7 gap-1.5 rounded-2xl bg-background p-3 ring-1 ring-border">
                {CATEGORY_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => {
                      setIcon(ic);
                      setIconPickerOpen(false);
                    }}
                    className={clsx(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors hover:bg-surface-elevated",
                      icon === ic && "bg-primary/20 ring-1 ring-primary"
                    )}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-2xl bg-linear-to-br from-primary to-primary-dark py-3 text-sm font-display font-bold text-[#06231f] shadow-lg shadow-primary/30 disabled:opacity-60"
              >
                {submitting ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "+ Thêm"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="shrink-0 rounded-2xl bg-background px-4 py-3 text-sm font-bold text-text-muted ring-1 ring-border"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-14 rounded-2xl" />
        </div>
      ) : categories!.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface p-8 text-center ring-1 ring-border">
          <p className="text-3xl">🗂️</p>
          <p className="font-display font-bold text-text">Chưa có danh mục nào</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 rounded-3xl bg-surface p-2 ring-1 ring-border">
          {categories!.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-2xl px-3 py-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-lg">
                {c.icon}
              </span>
              <p className="flex-1 truncate text-sm font-semibold text-text">{c.name}</p>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => startEdit(c)}
                  aria-label="Sửa"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-text-faint hover:text-text-muted"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(c)}
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
    </div>
  );
}
