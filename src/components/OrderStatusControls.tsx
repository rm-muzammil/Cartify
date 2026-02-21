"use client";

import { useRouter } from "next/navigation";

export default function OrderStatusControls({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();

  async function updateStatus(newStatus: string) {
    await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });

    router.refresh();
  }

  return (
    <div className="flex gap-2 flex-wrap">

      {status === "paid" && (
        <button
          className="btn-primary"
          onClick={() => updateStatus("shipped")}
        >
          🚚 Mark Shipped
        </button>
      )}

      {(status === "paid" || status === "shipped") && (
        <button
          className="btn-secondary"
          onClick={() => updateStatus("refunded")}
        >
          💸 Refund
        </button>
      )}

      {status !== "canceled" && status !== "refunded" && (
        <button
          className="btn-danger"
          onClick={() => updateStatus("canceled")}
        >
          ❌ Cancel
        </button>
      )}
    </div>
  );
}
