export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createIncomeCategory, listIncomeCategories } from "@/lib/data/categories";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });

  try {
    const categories = await listIncomeCategories(user.id);
    return NextResponse.json({ categories });
  } catch (err) {
    console.error("Lấy danh mục thu nhập thất bại:", err);
    return NextResponse.json({ error: "Không tải được danh mục thu nhập" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const icon = String(body?.icon ?? "💰").trim() || "💰";
  if (!name) return NextResponse.json({ error: "Vui lòng nhập tên danh mục" }, { status: 400 });

  try {
    const category = await createIncomeCategory(user.id, { name, icon });
    return NextResponse.json({ category });
  } catch (err) {
    console.error("Tạo danh mục thu nhập thất bại:", err);
    return NextResponse.json({ error: "Tên danh mục đã tồn tại hoặc không hợp lệ" }, { status: 400 });
  }
}
