"use client";

import { useEffect, useState,use } from "react";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const {storeId} = use(params)

  

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      setCart(JSON.parse(stored));
    }
  }, []);

  const handleCheckout = async () => {
   

    setLoading(true);

    const res = await fetch(
      `/api/store/${storeId}/checkout/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          
          cartItems: cart,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      localStorage.removeItem("cart");
      alert("Order created!");
      // Later → redirect to Stripe
      console.log("Order ID:", data.orderId);
    } else {
      alert(data.error || "Checkout failed");
    }

    setLoading(false);
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-10 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <div className="space-y-3">
        {/* <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-3 rounded"
        /> */}

        {/* <input
          type="email"
          placeholder="Email Address *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 rounded"
          required
        /> */}
      </div>

      <div className="border p-4 rounded space-y-2">
        <h2 className="font-semibold">Order Summary</h2>

        {cart.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>${item.price * item.quantity}</span>
          </div>
        ))}

        <div className="flex justify-between font-bold pt-2 border-t">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading || cart.length === 0}
        className="bg-black text-white px-6 py-3 rounded w-full"
      >
        {loading ? "Processing..." : "Place Order"}
      </button>
    </div>
  );
}
