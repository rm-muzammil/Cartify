"use client";
import { getCart } from "@/lib/cart";

export default function CheckoutPage() {
  async function startCheckout() {
    const cart = getCart();

    const res = await fetch("/api/checkout/start", {
      method: "POST",
      body: JSON.stringify({
        cart,
        email: "guest@example.com"
      }),
    });

    const { checkoutUrl } = await res.json();
    window.location.href = checkoutUrl;
  }

  return (
    <button className="btn-primary" onClick={startCheckout}>
      Pay Now
    </button>
  );
}
