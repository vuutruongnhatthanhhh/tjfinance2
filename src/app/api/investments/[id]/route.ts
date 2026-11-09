export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteInvestment, getInvestmentDetail, updateInvestment } from "@/lib/data/investments";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });

  const { id } = await params;
  try {
    const detail = await getInvestmentDetail(user.id, id);
    if (!detail) return NextResponse.json({ error: "Không tìm thấy khoản đầu tư này" }, { status: 404 });
    return NextResponse.json(detail);
  } catch (err) {
    console.error("Lấy chi tiết khoản đầu tư thất bại:", err);
    return NextResponse.json({ error: "Không tải được chi tiết khoản đầu tư" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const note = body?.note ? String(body.note).trim() : null;
  if (!name) return NextResponse.json({ error: "Vui lòng nhập tên khoản đầu tư" }, { status: 400 });

  try {
    await updateInvestment(user.id, id, { name, note });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Sửa khoản đầu tư thất bại:", err);
    return NextResponse.json({ error: "Sửa khoản đầu tư thất bại" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });

  const { id } = await params;
  try {
    await deleteInvestment(user.id, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Xoá khoản đầu tư thất bại:", err);
    return NextResponse.json({ error: "Xoá khoản đầu tư thất bại" }, { status: 400 });
  }
}
