import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { stripe } from "@/lib/stripe";

const PLATFORM_FEE_PERCENT = 10;


export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("customer_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      customerId: string;
      storeId: string;
    };

    if (decoded.storeId !== storeId) {
      return NextResponse.json({ error: "Invalid store" }, { status: 403 });
    }

    const { cartItems } = await req.json();

    if (!cartItems?.length) {
      return NextResponse.json({ error: "Cart empty" }, { status: 400 });
    }

    // Fetch store (must be connected)
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store?.stripeAccountId || !store.stripeOnboarded) {
      return NextResponse.json(
        { error: "Store not connected to Stripe" },
        { status: 400 }
      );
    }

    // Calculate total from DB (never trust client)
    let total = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product not found` },
          { status: 404 }
        );
      }

          if (product.stock < item.quantity) {
  return NextResponse.json(
    { error: `Not enough stock for ${product.name}` },
    { status: 400 }
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

    const commissionAmount = Math.round(
  (total * store.commissionRate) / 100 * 100
);



    // Create order first (pending)
    const order = await prisma.order.create({
      data: {
        storeId: store.id,
        customerId: decoded.customerId,
        total,
        status: "pending",
        items: {
          create: orderItems,
        },
      },
    });

    console.log("TOTAL:", total);
console.log("COMMISSION:", commissionAmount / 100);



    // Create PaymentIntent on CONNECTED account
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(total * 100),
        currency: "usd",
        application_fee_amount: commissionAmount,
        metadata: {
          orderId: order.id,
          storeId: store.id,
          customerId: decoded.customerId,
        },
      },
      {
        stripeAccount: store.stripeAccountId,
      }
    );


    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        platformFee: commissionAmount / 100,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}