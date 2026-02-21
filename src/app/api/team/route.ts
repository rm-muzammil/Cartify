import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const stores = await prisma.store.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
      include: {
        members: { include: { user: true } },
      },
    });

    return NextResponse.json(stores);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}
