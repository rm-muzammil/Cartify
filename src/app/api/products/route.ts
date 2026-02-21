import { NextResponse } from "next/server"
import  prisma  from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { getActiveStore } from "@/lib/store-context"

export async function GET(req: Request) {
  const url = new URL(req.url);
  const storeId = url.searchParams.get("storeId");
  const page = Number(url.searchParams.get("page") || 1);
  const limit = Number(url.searchParams.get("limit") || 10);
  const search = url.searchParams.get("search") || "";

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!storeId) return NextResponse.json({ error: "Missing storeId" }, { status: 400 });

  const skip = (page - 1) * limit;

  const products = await prisma.product.findMany({
    where: {
      storeId,
      name: { contains: search, mode: "insensitive" },
    },
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
  });

  // Compute sales stats
  const stats = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { productId: { in: products.map((p) => p.id) } },
    _sum: { quantity: true, price: true },
  });

  const productsWithStats = products.map((p) => {
    const stat = stats.find((s) => s.productId === p.id);
    return {
      ...p,
      totalSold: stat?._sum.quantity || 0,
      revenue: stat?._sum.price || 0,
    };
  });

  return NextResponse.json(productsWithStats);
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { storeId, name, description, price, stock, images } = body

    // 1. Check store ownership
    // const store = await prisma.store.findFirst({
    //   where: {
    //     id: storeId,
    //     ownerId: user.id,
    //   },
    // })

    const store = await getActiveStore(user.id, storeId);

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // 2. Create product
    const product = await prisma.product.create({
      data: {
        storeId: store!.id,
        name,
        description,
        price,
        stock,
        images:images || [],
      },
    })

    return NextResponse.json(product)

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
