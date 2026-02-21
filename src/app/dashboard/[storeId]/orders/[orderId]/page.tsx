import prisma from "@/lib/db";

import OrderStatusControls from "@/components/OrderStatusControls";

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ storeId: string; orderId: string }>;
}) {
  const {orderId} = await params
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: true },
      },
      payment: true,
    },
  });

  if (!order) return <p>Order not found</p>;

  return (
    <div className="space-y-6">



      <h1 className="text-2xl font-bold">
        Order #{order.id.slice(0, 8)}
      </h1>

      <div className="card space-y-3">

        {order.items.map(item => (
          <div
            key={item.id}
            className="flex justify-between border-b pb-2"
          >
            <span>
              {item.product.name} × {item.quantity}
            </span>

            <span className="font-semibold">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}

        <div className="flex justify-between pt-2 font-bold text-lg">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="card">
        <p>Status: <strong>{order.status}</strong></p>
        <p>Payment: {order.payment?.status || "Not paid"}</p>
      </div>
      <div className="card space-y-3">
  <p>Status: <strong>{order.status}</strong></p>
  <p>Payment: {order.payment?.status || "Not paid"}</p>

  <OrderStatusControls 
    orderId={order.id}
    status={order.status}
  />
</div>

    </div>
  );
}
