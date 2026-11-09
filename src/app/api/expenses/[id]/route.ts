export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteExpense, updateExpense } from "@/lib/data/expenses";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const amount = Number(body?.amount);
  const categoryId = body?.categoryId ? String(body.categoryId) : null;
  const description = body?.description ? String(body.description).trim() : null;

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Số tiền không hợp lệ" }, { status: 400 });
  }

  try {
    await updateExpense(user.id, id, { categoryId, description, amount });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Sửa chi tiêu thất bại:", err);
    return NextResponse.json({ error: "Sửa chi tiêu thất bại" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });

  const { id } = await params;
  try {
    await deleteExpense(user.id, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Xoá chi tiêu thất bại:", err);
    return NextResponse.json({ error: "Xoá chi tiêu thất bại" }, { status: 400 });
  }
}
