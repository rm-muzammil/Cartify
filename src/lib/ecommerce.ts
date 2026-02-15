import prisma from "@/lib/db";
import { getUserStore } from "@/lib/store";

export async function getStoreContext() {
  const store = await getUserStore();
  if (!store) throw new Error("No store found");

  return store;
}

export async function getStoreProducts() {
  const store = await getStoreContext();

  return prisma.product.findMany({
    where: { storeId: store.id },
  });
}

export async function getStoreOrders() {
  const store = await getStoreContext();

  return prisma.order.findMany({
    where: { storeId: store.id },
  });
}
