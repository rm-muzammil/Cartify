"use client";

import { useEffect, useState,use } from "react";
import Link from "next/link";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export default function CartPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      setCart(JSON.parse(stored));
    }
  }, []);

  const updateQuantity = (index: number, quantity: number) => {
    const updated = [...cart];
    updated[index].quantity = quantity;
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const {storeId} = use(params)

  return (
    <div className="p-10 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Your Cart</h1>

      {cart.length === 0 && <p>Your cart is empty.</p>}

      {cart.map((item, index) => (
        <div
          key={index}
          className="border p-4 rounded flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">{item.name}</p>
            <p>${item.price}</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) =>
                updateQuantity(index, Number(e.target.value))
              }
              className="w-16 border rounded p-1"
            />

            <button
              onClick={() => removeItem(index)}
              className="text-red-500"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      {cart.length > 0 && (
        <>
          <p className="text-xl font-semibold">Total: ${total.toFixed(2)}</p>

          <Link
            href={`/store/${storeId}/checkout`}
            className="bg-black text-white px-6 py-3 rounded inline-block"
          >
            Proceed to Checkout
          </Link>
        </>
      )}
    </div>
  );
}
