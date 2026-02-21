import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/db";
import { headers } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const {storeId}=await params
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store || !store.stripeAccountId) {
      return NextResponse.redirect("/dashboard");
    }
    const bodyHeaders = await headers()

    const origin = bodyHeaders.get("origin");

    const accountLink = await stripe.accountLinks.create({
      account: store.stripeAccountId,
      refresh_url: `${origin}/api/stores/${store.id}/stripe/refresh`,
      return_url: `${origin}/dashboard/${store.id}`,
      type: "account_onboarding",
    });

    return NextResponse.redirect(accountLink.url);
  } catch (error) {
    console.error("Stripe refresh error:", error);
    return NextResponse.redirect("/dashboard");
  }
}