import Stripe from "stripe";
import { headers } from "next/headers";
import prisma from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const reqHeader = await headers()
  const sig = reqHeader.get("stripe-signature");

  if (!sig) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new Response("Webhook error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session: any = event.data.object;
    const orderId = session.metadata.orderId;

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "paid" },
    });

    await prisma.payment.create({
      data: {
        orderId,
        provider: "stripe",
        amount: session.amount_total / 100,
        status: "paid",
      },
    });
  }

  return new Response("OK");
}
