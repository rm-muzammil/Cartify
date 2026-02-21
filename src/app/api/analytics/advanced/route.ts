import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("storeId");
  if (!storeId) return NextResponse.json({ error: "Missing storeId" }, { status: 400 });

  // Total orders and paid orders
  const orders = await prisma.order.findMany({
    where: { storeId },
    select: { id: true, total: true, status: true, createdAt: true },
  });

  const totalOrders = orders.length;
  const paidOrders = orders.filter(o => o.status === "paid").length;
  const refundedOrders = orders.filter(o => o.status === "refunded").length;

  // Churn rate = refunded / total paid orders
  const churnRate = paidOrders > 0 ? (refundedOrders / paidOrders) * 100 : 0;

  // Average Order Value (AOV)
  const totalRevenue = orders
    .filter(o => o.status === "paid")
    .reduce((sum, o) => sum + o.total, 0);

  const aov = paidOrders > 0 ? totalRevenue / paidOrders : 0;

  return NextResponse.json({
    totalOrders,
    paidOrders,
    refundedOrders,
    churnRate: churnRate.toFixed(1),
    aov: aov.toFixed(2),
  });
}
