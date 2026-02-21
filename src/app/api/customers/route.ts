import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  const { storeId, name, email } = await req.json();

  if (!storeId || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // reuse existing customer by email (nice UX)
  if (email) {
    const existing = await prisma.customer.findFirst({
      where: { storeId, email }
    });
    if (existing) return NextResponse.json(existing);
  }

  const customer = await prisma.customer.create({
    data: { storeId, name, email }
  });

  return NextResponse.json(customer);
}
