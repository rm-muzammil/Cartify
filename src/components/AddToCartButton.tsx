// src/components/AddToCartButton.tsx
"use client"; // This allows onClick and localStorage

export default function AddToCartButton({ product }: { product: any }) {
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  return (
    <button onClick={addToCart} className="btn-primary">
      Add to Cart
    </button>
  );
}