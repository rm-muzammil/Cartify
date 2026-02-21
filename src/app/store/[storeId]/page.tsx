import prisma from "@/lib/db";

export default async function StorePage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
    const store = await prisma.store.findUnique({

    where: { id: storeId },
    include: { products: true },
  });

  if (!store) return <p>Store not found</p>;

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-3xl font-bold">{store.name}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {store.products.map(product => (
          <a
            key={product.id}
            href={`/store/${store.id}/product/${product.id}`}
            className="card"
          >
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
