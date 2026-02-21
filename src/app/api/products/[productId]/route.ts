import { NextRequest, NextResponse } from "next/server"
import  prisma  from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"


export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await params
    const body = await req.json()

    const { name, price, stock } = body

    // Find product + verify ownership via store
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        store: {
          ownerId: user.id,
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price,
        stock,
      },
    })

    return NextResponse.json(updated)

  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await params;

    // Get product with store ownership check
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        store: {
          ownerId: user.id
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}