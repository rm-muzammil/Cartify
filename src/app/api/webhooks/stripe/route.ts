import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.text();
  const bodyHeaders = await headers();
  const signature = bodyHeaders.get("stripe-signature")!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

if (event.type === "payment_intent.succeeded") {
  const paymentIntent = event.data.object as any;
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) return;

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.status === "paid") return;

    // Decrement stock safely
    for (const item of order.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.stock < item.quantity) {
        throw new Error("Stock inconsistency detected");
      }

      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "paid" },
    });
  });

  console.log("Order completed with stock decrement:", orderId);
}

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as any;

      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "failed" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}