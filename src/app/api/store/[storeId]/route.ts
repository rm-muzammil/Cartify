import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { 
  params 
}: { 
  params: Promise<{ storeId: string }> 
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // unwrap params
    const { storeId } = await params;

    if (!storeId) return NextResponse.json({ error: "Store ID missing" }, { status: 400 });

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { members: { include: { user: true } }, products: true },
    });

    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    // Check ownership or team membership
    if (store.ownerId !== user.id && !store.members.some(m => m.userId === user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(store);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch store" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ storeId: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { storeId } = await context.params; // <-- unwrap here
    if (!storeId) return NextResponse.json({ error: "Store ID missing" }, { status: 400 });

    const body = await req.json();
    const { name } = body;

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
    if (store.ownerId !== user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: { name },
    });

    return NextResponse.json(updatedStore);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const user = await getCurrentUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const store = await prisma.store.findUnique({
      where: { id: storeId }
    })

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

        if (store.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Use a transaction to clean up related data first
    await prisma.$transaction([
      // 1. Delete Team Members
      prisma.teamMember.deleteMany({ where: { storeId } }),
      // 2. Delete Orders (and their items if not using Cascade)
      prisma.order.deleteMany({ where: { storeId } }),
      // 3. Delete Products
      prisma.product.deleteMany({ where: { storeId } }),
      // 4. Finally, delete the store
      prisma.store.delete({
        where: { id: storeId, ownerId: user.id },
      }),
    ]);

    return NextResponse.json({ message: "Store deleted successfully" });
  } catch (error) {
    console.error("DELETE STORE ERROR:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}