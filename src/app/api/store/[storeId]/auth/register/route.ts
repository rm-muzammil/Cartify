import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(
  req: Request,
  // 1. Next.js 15+ requires params to be a Promise
  { params }: { params: Promise<{ storeId: string }> } 
) {
  try {
    // 2. Await the params to get the actual storeId
    const { storeId } = await params;
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // 3. Find existing customer
    // Note: If you haven't run 'npx prisma migrate dev' with @@unique([email, storeId]),
    // change 'findUnique' to 'findFirst' and use: where: { email, storeId }
    const existing = await prisma.customer.findUnique({
      where: {
        email_storeId: {
          email,
          storeId: storeId
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: "Customer already exists in this store" },
        { status: 400 }
      );
    }

    // 4. Hash the password
    const hashed = await bcrypt.hash(password, 10);

    // 5. Create the customer
    const customer = await prisma.customer.create({
      data: {
        email,
        password: hashed,
        name,
        storeId: storeId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Customer registered successfully" 
    });

  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}