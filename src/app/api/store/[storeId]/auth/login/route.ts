import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { email, password } = await req.json();
  const {storeId} = await params

  const customer = await prisma.customer.findUnique({
    where: {
      email_storeId: {
        email,
        storeId: storeId
      }
    }
  });

  if (!customer) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 400 }
    );
  }

  if (!customer || !customer.password) {
  return NextResponse.json(
    { error: "Invalid credentials or account not set up" }, 
    { status: 401 }
  );
}

  const valid = await bcrypt.compare(password, customer.password);

  if (!valid) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 400 }
    );
  }

  const token = jwt.sign(
    {
      customerId: customer.id,
      storeId: storeId
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  const response = NextResponse.json({ success: true });

  response.cookies.set("customer_token", token, {
    httpOnly: true,
    path: "/"
  });

  return response;
}
