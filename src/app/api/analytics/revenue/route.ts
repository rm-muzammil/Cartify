import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { storeId } = Object.fromEntries(req.nextUrl.searchParams);

    // Total Revenue (paid orders)
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { storeId, status: "paid" },
    });

    const orders = await prisma.order.findMany({
  where: { storeId, status: "paid" },
  select: { total: true, createdAt: true }
});

const monthlyData = orders.reduce((acc: any, order) => {
  const month = order.createdAt.toLocaleString('default', { month: 'short' });
  acc[month] = (acc[month] || 0) + order.total;
  return acc;
}, {});

    // Revenue by Month
    const revenueByMonth = await prisma.order.groupBy({
      by: ["createdAt"],
      where: { storeId, status: "paid" },
      _sum: { total: true },
    });

    // Order counts
    const orderCounts = await prisma.order.groupBy({
      by: ["status"],
      where: { storeId },
      _count: { id: true },
    });
    const totalCustomers = await prisma.user.count({
  where: { subscription: { plan: { not: "free" } } },
});

const churnedCustomers = await prisma.user.count({
  where: { subscription: { status: "canceled" } },
});

const churnRate = (churnedCustomers / totalCustomers) * 100;


const lastMonthRevenue = revenueByMonth[revenueByMonth.length - 2]?._sum.total || 0;
const thisMonthRevenue = revenueByMonth[revenueByMonth.length - 1]?._sum.total || 0;

const growthRate = lastMonthRevenue > 0
  ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
  : 0;

  

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.total || 0,
      revenueByMonth,
      orderCounts,
      churnRate,
      growthRate,
    });

    
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch revenue analytics" }, { status: 500 });
  }
}
