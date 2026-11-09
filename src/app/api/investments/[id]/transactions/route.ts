export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addInvestmentTransaction } from "@/lib/data/investments";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const type = body?.type === "withdraw" ? "withdraw" : body?.type === "deposit" ? "deposit" : null;
  const amount = Number(body?.amount);
  const note = body?.note ? String(body.note).trim() : null;

  if (!type) return NextResponse.json({ error: "Loại giao dịch không hợp lệ" }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Số tiền không hợp lệ" }, { status: 400 });
  }

  try {
    await addInvestmentTransaction(user.id, id, type, amount, note);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Giao dịch thất bại";
    console.error("Giao dịch đầu tư thất bại:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
