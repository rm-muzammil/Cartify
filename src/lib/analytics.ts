import prisma from "./db";
import { OrderStatus } from "@/generated/prisma/enums";

// 1️⃣ Get all orders by status for a store
export async function getOrdersByStatus(storeId: string, status: OrderStatus) {
  return prisma.order.findMany({
    where: { storeId, status },
    include: { items: { include: { product: true } }, payment: true },
  });
}

// 2️⃣ Calculate monthly revenue
export async function getMonthlyRevenue(storeId: string) {
  return prisma.order.aggregate({
    where: { storeId, status: "paid" },
    _sum: { total: true },
  });
}

// 3️⃣ Top-selling products
export async function getTopProducts(storeId: string, limit = 5) {
  return prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { storeId, status: OrderStatus.paid } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });
}

// 4️⃣ Total users and orders (for dashboard cards)
export async function getStoreStats(storeId: string) {
  const totalOrders = await prisma.order.count({ where: { storeId } });
  const totalRevenueAgg = await prisma.order.aggregate({
    where: { storeId, status: "paid" },
    _sum: { total: true },
  });

  return {
    totalOrders,
    totalRevenue: totalRevenueAgg._sum.total || 0,
  };
}
