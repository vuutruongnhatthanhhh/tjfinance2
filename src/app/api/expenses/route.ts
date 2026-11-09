export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { customRange } from "@/lib/date";
import { createExpense, listExpenses } from "@/lib/data/expenses";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const range = from && to ? customRange(from, to) : undefined;
    const expenses = await listExpenses(user.id, range);
    return NextResponse.json({ expenses });
  } catch (err) {
    console.error("Lấy danh sách chi tiêu thất bại:", err);
    return NextResponse.json({ error: "Không tải được danh sách chi tiêu" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const amount = Number(body?.amount);
  const categoryId = body?.categoryId ? String(body.categoryId) : null;
  const description = body?.description ? String(body.description).trim() : null;

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Số tiền không hợp lệ" }, { status: 400 });
  }

  try {
    await createExpense(user.id, { categoryId, description, amount });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Tạo chi tiêu thất bại:", err);
    return NextResponse.json({ error: "Tạo chi tiêu thất bại" }, { status: 500 });
  }
}
