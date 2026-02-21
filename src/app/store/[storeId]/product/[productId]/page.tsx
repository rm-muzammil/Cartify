import prisma from "@/lib/db";
import AddToCartButton from "@/components/AddToCartButton"; 
export default async function ProductPage({
  params,
}: {
  params: Promise<{ storeId: string; productId: string }>;
}) {
    const {productId} = await params
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) return <p>Product not found</p>;

  return (
    <div className="p-10 space-y-4">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p className="text-xl">${product.price}</p>
      <p>Stock: {product.stock}</p>

      <AddToCartButton product={product} />
    </div>
  );
}

// function addToCart(product: any) {
//   const cart = JSON.parse(localStorage.getItem("cart") || "[]");

//   cart.push({
//     productId: product.id,
//     name: product.name,
//     price: product.price,
//     quantity: 1,
//   });

//   localStorage.setItem("cart", JSON.stringify(cart));
// }
