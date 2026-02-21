import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import jwt from "jsonwebtoken";

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

    let decoded: any;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // 🚨 SECURITY: ensure token store matches route store
    if (decoded.storeId !== storeId) {
      return NextResponse.json({ error: "Store mismatch" }, { status: 403 });
    }

    const { cartItems } = await req.json();

    if (!cartItems?.length) {
      return NextResponse.json({ error: "Cart empty" }, { status: 400 });
    }

    // Always calculate on server
    const total = cartItems.reduce(
      (sum: number, item: any) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    );

    // ✅ Directly create order for logged-in customer
    const order = await prisma.order.create({
      data: {
        storeId,
        customerId: decoded.customerId,
        total,
        status: "pending",
        items: {
          create: cartItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    return NextResponse.json({ orderId: order.id });

  } catch (error) {
    console.error("ORDER_CREATION_ERROR", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}