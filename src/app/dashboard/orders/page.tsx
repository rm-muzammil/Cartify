"use client";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/orders")
      .then(r => r.json())
      .then(setOrders);
  }, []);

  return (
    <div className="space-y-4 bg-gray-700">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="card overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th>ID</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody className="bg-gray-600">
            {orders.map((o:any) => (
              <tr key={o.id} className="border-b">
                <td>{o.id.slice(0,6)}</td>
                <td>${o.total}</td>
                <td >
  <select
    value={o.status}
    onChange={async e => {
      await fetch(`/api/orders/${o.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: e.target.value }),
      });
    }}
    className="border rounded p-1 bg-transparent"
  >
    <option value="pending">Pending</option>
    <option value="checkout">Checkout</option>
    <option value="paid">Paid</option>
    <option value="shipped">Shipped</option>
    <option value="refunded">Refunded</option>
    <option value="canceled">Canceled</option>
  </select>
</td>

                {/* <td>
                  <span className="px-2 py-1 rounded text-xs bg-indigo-100 dark:bg-indigo-900">
                    {o.status}
                  </span>
                </td> */}
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
