import prisma from "@/lib/db";
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { cart, email, storeId } = await req.json(); // Fixed storeId destructing

    if (!storeId || storeId === "undefined") {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
    }

    // Use a transaction so we don't end up with a Customer but no Order
    const result = await prisma.$transaction(async (tx) => {
      // 1. Upsert Customer (Avoid duplicate emails in the same store)
      const customer = await tx.customer.upsert({
        where: { id: "some-id-logic-or-email" }, // Ideally search by email + storeId
        update: {},
        create: {
          name: "Guest",
          email,
          password:"pass1234",
          storeId,
        },
      });

      // 2. Create Order & Items in one nested call (Much faster!)
      const order = await tx.order.create({
        data: {
          storeId,
          customerId: customer.id,
          total: cart.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
          status: "pending", // Using 'pending' until Stripe confirms payment
          items: {
            create: cart.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      return order;
    });

    // 3. Stripe session creation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: cart.map((i: any) => ({
        price_data: {
          currency: "usd",
          product_data: { name: i.name },
          unit_amount: Math.round(i.price * 100), // Stripe expects cents as Integers
        },
        quantity: i.quantity,
      })),
      mode: "payment",
      // Important: Add metadata so your Webhook knows which order to update later
      metadata: {
        orderId: result.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?order=${result.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("CHECKOUT_ERROR", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}