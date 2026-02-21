import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

    const user = await getCurrentUser();

    const stores = await prisma.store.findMany({
    where: { ownerId: user?.id },
    take: 5,
  });
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-800">
      <Sidebar stores={stores} />

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
