export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { customRange, monthRange, yearRange } from "@/lib/date";
import { getStatsSummary } from "@/lib/data/stats";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") ?? "month";

  try {
    let range;
    if (mode === "year") {
      const year = Number(searchParams.get("year"));
      if (!Number.isFinite(year)) return NextResponse.json({ error: "Năm không hợp lệ" }, { status: 400 });
      range = yearRange(year);
    } else if (mode === "custom") {
      const from = searchParams.get("from");
      const to = searchParams.get("to");
      if (!from || !to) return NextResponse.json({ error: "Vui lòng chọn khoảng ngày" }, { status: 400 });
      range = customRange(from, to);
    } else {
      const month = searchParams.get("month");
      const match = month?.match(/^(\d{4})-(\d{2})$/);
      if (!match) return NextResponse.json({ error: "Tháng không hợp lệ" }, { status: 400 });
      range = monthRange(Number(match[1]), Number(match[2]));
    }

    const stats = await getStatsSummary(user.id, range);
    return NextResponse.json({ stats });
  } catch (err) {
    console.error("Lấy thống kê thất bại:", err);
    return NextResponse.json({ error: "Không tải được thống kê" }, { status: 500 });
  }
}
