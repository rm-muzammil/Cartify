import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orderId } = await params;
    const { status } = await req.json();

  const allowed = [
    "pending",
    "checkout",
    "paid",
    "shipped",
    "canceled",
    "refunded",
    "failed",
  ];

  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // If cancel or refund, return stock
    if (["canceled", "refunded"].includes(status)) {
      await Promise.all(
        order.items.map(item =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        )
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: `Updated order ${orderId} status to ${status}`,
    entity: "order",
    entityId: orderId,
  },
});

    return NextResponse.json(updatedOrder);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
