"use client";

import { useEffect, useState } from "react";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="p-10 space-y-4">
      <h1 className="text-3xl font-bold">Your Cart</h1>

      {cart.map((item, i) => (
        <div key={i} className="card flex justify-between">
          <span>{item.name}</span>
          <span>${item.price}</span>
        </div>
      ))}

      <p className="text-xl font-semibold">Total: ${total}</p>

      <a href="/checkout" className="btn-primary inline-block">
        Checkout
      </a>
    </div>
  );
}
