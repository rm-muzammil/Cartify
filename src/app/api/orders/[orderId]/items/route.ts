import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
    try {
      const {orderId} = params
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity } = await req.json();

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true },
    });

    if (!order || order.store.ownerId !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: {
          id: productId,
          storeId: order.storeId,
        },
      });

      if (!product) throw new Error("Product not found");

      if (product.stock < quantity) {
        throw new Error("Not enough stock");
      }

      // 🔒 Atomic stock decrease
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: { decrement: quantity },
        },
      });

      // 🧾 Create order item
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity,
          price: product.price,
        },
      });

      // 💰 Update order total
      return tx.order.update({
        where: { id: order.id },
        data: {
          total: { increment: product.price * quantity },
        },
        include: { items: true },
      });
    });

    await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: `Updated order ${orderId} status to ${status}`,
    entity: "order",
    entityId: orderId,
  },
});

    return NextResponse.json(result);

  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      { error: err.message || "Failed to add item" },
      { status: 400 }
    );
  }
}
