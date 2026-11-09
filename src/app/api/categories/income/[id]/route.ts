export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteIncomeCategory, updateIncomeCategory } from "@/lib/data/categories";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const icon = String(body?.icon ?? "").trim();
  if (!name || !icon) return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });

  try {
    await updateIncomeCategory(user.id, id, { name, icon });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Sửa danh mục thu nhập thất bại:", err);
    return NextResponse.json({ error: "Sửa danh mục thất bại" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });

  const { id } = await params;
  try {
    await deleteIncomeCategory(user.id, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Xoá danh mục thu nhập thất bại:", err);
    return NextResponse.json({ error: "Xoá danh mục thất bại" }, { status: 400 });
  }
}
