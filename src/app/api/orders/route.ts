import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";


export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch orders for all stores owned by this user
    const orders = await prisma.order.findMany({
      where: {
        store: { ownerId: user.id }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest,{params}:{params:Promise<{orderId:string}>}) {
  try {
    const {orderId} = await params
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { storeId,customerId } = await req.json();

    if (!storeId || !customerId) {
      return NextResponse.json({ error: "Store and customer required" }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId: user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const order = await prisma.order.create({
      data: {
        storeId, 
        customerId,
        total: 0,
        status: "pending",
      },
    });

    await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: `Updated order ${orderId} status to ${status}`,
    entity: "order",
    entityId: orderId,
  },
});

    

    return NextResponse.json(order);

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
