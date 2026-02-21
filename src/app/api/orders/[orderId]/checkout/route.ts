import { NextResponse } from "next/server";
import  prisma  from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {orderId} = await params

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.items.length === 0) {
    return NextResponse.json({ error: "Empty order" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "checkout" },
  });

  return NextResponse.json({
    message: "Ready for payment",
    total: order.total,
  });
}
