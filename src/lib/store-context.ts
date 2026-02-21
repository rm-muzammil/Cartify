import prisma from "@/lib/db";

export async function getActiveStore(userId: string, storeId?: string) {
  if (storeId) {
    return prisma.store.findFirst({
      where: { id: storeId, ownerId: userId }
    });
  }

  return prisma.store.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" }
  });
}
