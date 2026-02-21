import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await params;
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true,items:{
    include:{
        product:true
    }
  } } });

  if (!order || !order.payment) return NextResponse.json({ error: "Order/payment not found" }, { status: 404 });

  try {
    // Refund via Stripe if payment provider is stripe
    if (order.payment.provider === "stripe") {
      await stripe.refunds.create({ payment_intent: order.payment.id });
    }

    // Update order + payment status
    await prisma.order.update({ where: { id: orderId }, data: { status: "refunded" } });
    await prisma.payment.update({ where: { orderId }, data: { status: "refunded" } });

    // Return stock
    await Promise.all(
      order.items.map(item =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      )
    );

    await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: `Updated order ${orderId} status to ${status}`,
    entity: "order",
    entityId: orderId,
  },
});

    return NextResponse.json({ message: "Refund successful" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Refund failed" }, { status: 500 });
  }
}
