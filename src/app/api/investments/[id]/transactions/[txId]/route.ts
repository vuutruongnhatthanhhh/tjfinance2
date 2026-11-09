export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteInvestmentTransaction } from "@/lib/data/investments";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; txId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });

  const { txId } = await params;
  try {
    await deleteInvestmentTransaction(user.id, txId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Xoá giao dịch đầu tư thất bại:", err);
    return NextResponse.json({ error: "Xoá giao dịch thất bại" }, { status: 400 });
  }
}
