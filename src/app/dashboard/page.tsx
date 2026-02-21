import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardHome() {
  const user = await getCurrentUser();

  // 1. Safety First: Redirect if not logged in
  if (!user) {
    redirect("/login");
  }

  const stores = await prisma.store.findMany({
    where: { ownerId: user.id }
  });



  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Stores</h1>
        <Link 
          href="/dashboard/new" 
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          + Create Store
        </Link>
      </div>

      {/* 2. Empty State Handling */}
      {stores.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed rounded-xl">
          <p className="text-gray-500 mb-4">You haven't created any stores yet.</p>
          <Link href="/dashboard/new" className="text-indigo-600 font-semibold">
            Get started by creating your first shop &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {stores.map(store => (
            <Link
              key={store.id}
              href={`/dashboard/${store.id}`}
              className="p-6 bg-white border rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
            >
              <h2 className="text-xl font-semibold group-hover:text-indigo-600">
                {store.name}
              </h2>
              <p className="text-sm text-gray-400 mt-2">Manage products and orders &rarr;</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}