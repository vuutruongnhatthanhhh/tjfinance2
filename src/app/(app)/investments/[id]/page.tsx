"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import clsx from "clsx";
import Modal from "@/components/Modal";
import Skeleton from "@/components/Skeleton";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Investment, InvestmentTransaction } from "@/lib/types";

type TxType = "deposit" | "withdraw";

export default function InvestmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [investment, setInvestment] = useState<Investment | null>(null);
  const [transactions, setTransactions] = useState<InvestmentTransaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [txType, setTxType] = useState<TxType>("deposit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    try {
      const res = await fetch(`/api/investments/${id}`).then((r) => r.json());
      if (res.error) throw new Error(res.error);
      setInvestment(res.investment);
      setTransactions(res.transactions ?? []);
    } catch {
      setError("Không tải được khoản đầu tư này.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setFormError("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setSubmitting(true);
    const res = await fetch(`/api/investments/${id}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: txType, amount: amountNum, note: note.trim() || null }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setFormError(data.error ?? "Có lỗi xảy ra, vui lòng thử lại");
      return;
    }

    setAmount("");
    setNote("");
    setModalOpen(false);
    load();
  }

  function openTx(type: TxType) {
    setTxType(type);
    setAmount("");
    setNote("");
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setFormError(null);
  }

  async function handleDeleteTransaction(txId: string) {
    await fetch(`/api/investments/${id}/transactions/${txId}`, { method: "DELETE" });
    load();
  }

  async function handleDeleteInvestment() {
    if (!confirm(`Xoá khoản đầu tư "${investment?.name}"? Toàn bộ lịch sử giao dịch sẽ bị xoá.`)) return;
    await fetch(`/api/investments/${id}`, { method: "DELETE" });
    router.push("/investments");
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 px-5 pt-6 md:mx-auto md:max-w-2xl md:px-10 md:pt-10">
        <p className="rounded-2xl bg-expense/15 px-4 py-3 text-sm text-expense-soft">{error}</p>
        <Link href="/investments" className="text-sm font-bold text-primary-soft">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (!investment || !transactions) {
    return (
      <div className="flex flex-col gap-4 px-5 pt-6 md:mx-auto md:max-w-2xl md:px-10 md:pt-10">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-48 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 md:mx-auto md:max-w-2xl md:px-10 md:pt-10">
      <Link href="/investments" className="text-sm font-bold text-primary-soft">
        ← Danh sách khoản đầu tư
      </Link>

      <div className="flex flex-col gap-2 rounded-3xl bg-surface p-5 ring-1 ring-border">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-text">{investment.name}</h1>
            {investment.note && <p className="mt-1 text-sm text-text-muted">{investment.note}</p>}
          </div>
          <button onClick={handleDeleteInvestment} aria-label="Xoá khoản đầu tư" className="shrink-0 text-lg text-text-faint hover:text-expense-soft">
            🗑️
          </button>
        </div>
        <p className="font-display text-2xl font-bold text-invest-soft">{formatCurrency(investment.balance)}</p>
        <div className="flex gap-4 text-xs text-text-faint">
          <span>Đã góp: {formatCurrency(investment.totalDeposit)}</span>
          <span>Đã rút: {formatCurrency(investment.totalWithdraw)}</span>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => openTx("deposit")}
            className="flex-1 rounded-2xl bg-linear-to-br from-income to-income-dark py-3 font-display font-bold text-[#06231f] shadow-lg shadow-income/30"
          >
            ⬆️ Góp tiền
          </button>
          <button
            onClick={() => openTx("withdraw")}
            className="flex-1 rounded-2xl bg-linear-to-br from-expense to-expense-dark py-3 font-display font-bold text-[#2a0a10] shadow-lg shadow-expense/30"
          >
            ⬇️ Rút tiền
          </button>
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={txType === "deposit" ? "Góp tiền" : "Rút tiền"}>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTxType("deposit")}
              className={clsx(
                "flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors",
                txType === "deposit" ? "bg-income/20 text-income-soft" : "bg-background text-text-faint"
              )}
            >
              ⬆️ Góp tiền
            </button>
            <button
              type="button"
              onClick={() => setTxType("withdraw")}
              className={clsx(
                "flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors",
                txType === "withdraw" ? "bg-expense/20 text-expense-soft" : "bg-background text-text-faint"
              )}
            >
              ⬇️ Rút tiền
            </button>
          </div>

          {formError && <div className="rounded-xl bg-expense/15 px-3 py-2 text-sm text-expense-soft">{formError}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Số tiền (₫)"
              required
              className="rounded-xl bg-background px-4 py-3 text-base text-text ring-1 ring-border placeholder:text-text-faint"
            />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú (không bắt buộc)"
              className="rounded-xl bg-background px-4 py-3 text-base text-text ring-1 ring-border placeholder:text-text-faint"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className={clsx(
                  "flex-1 rounded-2xl py-3 font-display font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-60",
                  txType === "deposit"
                    ? "bg-linear-to-br from-income to-income-dark text-[#06231f] shadow-income/30"
                    : "bg-linear-to-br from-expense to-expense-dark text-[#2a0a10] shadow-expense/30"
                )}
              >
                {submitting ? "Đang lưu..." : txType === "deposit" ? "Góp tiền" : "Rút tiền"}
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
        </div>
      </Modal>

      <section className="flex flex-col gap-3">
        <p className="font-display text-sm font-bold text-text-muted">Lịch sử giao dịch</p>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface p-8 text-center ring-1 ring-border">
            <p className="text-3xl">🧾</p>
            <p className="font-display font-bold text-text">Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 rounded-3xl bg-surface p-2 ring-1 ring-border">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 rounded-2xl px-3 py-2.5">
                <span
                  className={clsx(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-lg",
                    tx.type === "deposit" ? "text-income-soft" : "text-expense-soft"
                  )}
                >
                  {tx.type === "deposit" ? "⬆️" : "⬇️"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">
                    {tx.type === "deposit" ? "Góp tiền" : "Rút tiền"}
                    {tx.note ? ` · ${tx.note}` : ""}
                  </p>
                  <p className="text-xs text-text-faint">{formatDateTime(tx.createdAt)}</p>
                </div>
                <p
                  className={clsx(
                    "shrink-0 text-sm font-bold",
                    tx.type === "deposit" ? "text-income-soft" : "text-expense-soft"
                  )}
                >
                  {tx.type === "deposit" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </p>
                <button
                  onClick={() => handleDeleteTransaction(tx.id)}
                  aria-label="Xoá giao dịch"
                  className="shrink-0 text-sm text-text-faint hover:text-expense-soft"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
