import prisma from "@/lib/db";

import Link from "next/link";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  checkout: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  shipped: "bg-purple-100 text-purple-700",
  canceled: "bg-red-100 text-red-700",
  refunded: "bg-gray-200 text-gray-700",
  failed: "bg-red-200 text-red-800",
};

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const {storeId}=await params
  const orders = await prisma.order.findMany({
    where: { storeId: storeId },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">

      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>

      <div className="card overflow-x-auto">

        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left text-gray-500">
              <th className="py-2">Order ID</th>
              <th>Status</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {orders.map(order => (
              <tr
                key={order.id}
                className="border-b hover:bg-gray-50 dark:hover:bg-zinc-800"
              >

                <td className="py-2 font-mono text-xs">
                  {order.id.slice(0, 8)}...
                </td>

                <td>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </td>

                <td>{order.items.length}</td>

                <td className="font-semibold">
                  ${order.total.toFixed(2)}
                </td>

                <td>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>

                <td>
                  <Link
                    href={`/dashboard/${storeId}/orders/${order.id}`}
                    className="btn-secondary"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <p className="text-center py-8 text-gray-400">
            No orders yet 📦
          </p>
        )}
      </div>
    </div>
  );
}
