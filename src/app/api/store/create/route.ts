import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth"; // your JWT helper

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Store name required" }, { status: 400 });
    }

    const store = await prisma.store.create({
      data: {
        name,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    // Optional audit log (pro SaaS touch)
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE_STORE",
        entity: "Store",
        entityId: store.id,
      },
    });

    return NextResponse.json(store);

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create store" },
      { status: 500 }
    );
  }
}
