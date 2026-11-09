"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Modal from "@/components/Modal";
import Skeleton from "@/components/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Investment } from "@/lib/types";

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/investments").then((r) => r.json());
      setInvestments(res.investments ?? []);
    } catch {
      setError("Không tải được danh sách khoản đầu tư.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) {
      setFormError("Vui lòng nhập tên khoản đầu tư");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/investments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), note: note.trim() || null }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setFormError(data.error ?? "Có lỗi xảy ra, vui lòng thử lại");
      return;
    }

    setName("");
    setNote("");
    setModalOpen(false);
    load();
  }

  function closeModal() {
    setModalOpen(false);
    setName("");
    setNote("");
    setFormError(null);
  }

  const loading = investments === null;
  const total = investments?.reduce((s, i) => s + i.balance, 0) ?? 0;

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 md:mx-auto md:max-w-3xl md:px-10 md:pt-10">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text-muted">Đầu tư</p>
          <h1 className="font-display text-2xl font-bold text-text">Khoản đầu tư</h1>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="shrink-0 rounded-2xl bg-linear-to-br from-invest to-invest-dark px-4 py-2.5 text-sm font-display font-bold text-[#2a1a00] shadow-lg shadow-invest/30"
        >
          + Tạo mới
        </button>
      </header>

      {error && <p className="rounded-2xl bg-expense/15 px-4 py-3 text-sm text-expense-soft">{error}</p>}

      {!loading && (
        <div className="rounded-3xl bg-surface p-5 ring-1 ring-border">
          <p className="text-sm text-text-muted">Tổng giá trị đầu tư</p>
          <p className="font-display text-2xl font-bold text-invest-soft">{formatCurrency(total)}</p>
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title="Tạo khoản đầu tư">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {formError && <div className="rounded-xl bg-expense/15 px-3 py-2 text-sm text-expense-soft">{formError}</div>}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-text">Tên khoản đầu tư</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Quỹ ETF VN30"
              required
              className="rounded-xl bg-background px-4 py-3 text-base text-text ring-1 ring-border placeholder:text-text-faint"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-text">Ghi chú (không bắt buộc)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú thêm về khoản đầu tư này"
              className="rounded-xl bg-background px-4 py-3 text-base text-text ring-1 ring-border placeholder:text-text-faint"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-2xl bg-linear-to-br from-invest to-invest-dark py-3 font-display font-bold text-[#2a1a00] shadow-lg shadow-invest/30 disabled:opacity-60"
            >
              {submitting ? "Đang tạo..." : "Tạo khoản đầu tư"}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="shrink-0 rounded-2xl bg-background px-4 py-3 text-sm font-bold text-text-muted ring-1 ring-border"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
        </div>
      ) : investments!.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface p-8 text-center ring-1 ring-border">
          <p className="text-3xl">📈</p>
          <p className="font-display font-bold text-text">Chưa có khoản đầu tư nào</p>
          <p className="text-sm text-text-muted">Tạo khoản đầu tư đầu tiên để bắt đầu theo dõi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {investments!.map((inv) => (
            <Link
              key={inv.id}
              href={`/investments/${inv.id}`}
              className="flex flex-col gap-2 rounded-3xl bg-surface p-5 ring-1 ring-border transition-colors hover:bg-surface-elevated"
            >
              <div className="flex items-center justify-between">
                <p className="truncate font-display text-base font-bold text-text">{inv.name}</p>
                <span className="text-xl">📈</span>
              </div>
              <p className="font-display text-lg font-bold text-invest-soft">{formatCurrency(inv.balance)}</p>
              {inv.note && <p className="truncate text-xs text-text-muted">{inv.note}</p>}
              <p className="text-xs text-text-faint">Tạo ngày {formatDate(inv.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
