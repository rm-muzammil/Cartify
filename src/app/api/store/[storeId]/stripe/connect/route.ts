import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const {storeId} = await params
    const cookieStore = await cookies();
    const token = cookieStore.get("customer_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Decode token (store owner auth - you can replace with your owner auth)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      customerId: string;
    };

    // Check if user is store owner (implement your owner check here)
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Optional: verify owner (you should have ownerId in Store model)
    // if (store.ownerId !== decoded.customerId) { return 403 }

    // If store already has stripe account, return onboarding link for re-onboarding (optional)
    let accountId = store.stripeAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: decoded.customerId + "@yourdomain.com", // Replace with store owner email
      });

      accountId = account.id;

      await prisma.store.update({
        where: { id: store.id },
        data: {
          stripeAccountId: accountId,
        },
      });
    }

    const origin = req.headers.get("origin");

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard/${store.id}/stripe/refresh`,
      return_url: `${origin}/dashboard/${store.id}`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("Stripe connect error:", error);
    return NextResponse.json(
      { error: "Stripe connect failed" },
      { status: 500 }
    );
  }
}