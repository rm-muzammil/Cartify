import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("customer_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      customerId: string;
      storeId: string;
    };

    if (decoded.storeId !== params.storeId) {
      return NextResponse.json({ error: "Invalid store" }, { status: 403 });
    }

    const { cartItems } = await req.json();

    if (!cartItems || !Array.isArray(cartItems)) {
      return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
    }

    // Fetch products and calculate total (never trust client total)
    let total = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Create Order (PENDING)
    const order = await prisma.order.create({
      data: {
        storeId: params.storeId,
        customerId: decoded.customerId,
        total,
        status: "pending",
        items: {
          create: orderItems,
        },
      },
    });

    // Get store Stripe account
    const store = await prisma.store.findUnique({
      where: { id: params.storeId },
    });

    if (!store?.stripeAccountId) {
      return NextResponse.json(
        { error: "Store not connected to payment" },
        { status: 400 }
      );
    }

    // Create PaymentIntent on connected account
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(total * 100), // convert to cents
        currency: "usd",
        metadata: {
          orderId: order.id,
          storeId: store.id,
          customerId: decoded.customerId,
        },
      },
      {
        stripeAccount: store.stripeAccountId, // Connect account context
      }
    );

    // Save PaymentIntent ID on order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}