export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createInvestment, listInvestments } from "@/lib/data/investments";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });

  try {
    const investments = await listInvestments(user.id);
    return NextResponse.json({ investments });
  } catch (err) {
    console.error("Lấy danh sách khoản đầu tư thất bại:", err);
    return NextResponse.json({ error: "Không tải được danh sách khoản đầu tư" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const note = body?.note ? String(body.note).trim() : null;
  if (!name) return NextResponse.json({ error: "Vui lòng nhập tên khoản đầu tư" }, { status: 400 });

  try {
    const id = await createInvestment(user.id, { name, note });
    return NextResponse.json({ id });
  } catch (err) {
    console.error("Tạo khoản đầu tư thất bại:", err);
    return NextResponse.json({ error: "Tạo khoản đầu tư thất bại" }, { status: 500 });
  }
}
