import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: params.storeId },
    });

    if (!store) {
      return NextResponse.redirect("/dashboard");
    }

    // Mark store as onboarded (stripe account already created)
    if (store.stripeAccountId) {
      await prisma.store.update({
        where: { id: store.id },
        data: { stripeOnboarded: true },
      });
    }

    return NextResponse.redirect(`/dashboard/${store.id}?stripe=connected`);
  } catch (error) {
    console.error("Stripe callback error:", error);
    return NextResponse.redirect("/dashboard");
  }
}