"use client";

import { useEffect, useState, use } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

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
  const { storeId } = use(params);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      setCart(JSON.parse(stored));
    }
  }, []);

  const handleCheckout = async () => {
    setLoading(true);

    const res = await fetch(`/api/store/${storeId}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItems: cart }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Checkout failed");
      setLoading(false);
      return;
    }

    setClientSecret(data.clientSecret);
    setOrderId(data.orderId);
    setLoading(false);
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-10 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Checkout</h1>

      {!clientSecret && (
        <>
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
        </>
      )}

      {clientSecret && orderId && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm storeId={storeId} orderId={orderId} />
        </Elements>
      )}
    </div>
  );
}

function PaymentForm({
  storeId,
  orderId,
}: {
  storeId: string;
  orderId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/store/${storeId}/order-success?orderId=${orderId}`,
      },
    });

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        disabled={loading}
        className="bg-green-600 text-white px-6 py-3 rounded w-full"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}