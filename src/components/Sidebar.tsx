"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store } from "lucide-react";
interface StoreData {
  id: string;
  name: string;
}



export default function Sidebar({ stores }: { stores: StoreData[] }) {
const pathname = usePathname();



return (
    <aside className="w-64 bg-white dark:bg-zinc-900 border-r min-h-screen p-4 space-y-6">
      <div className="text-2xl font-bold text-indigo-600">Copify SaaS</div>

      <nav className="space-y-2">
        <Link href="/dashboard" className="sidebar-link block">📊 Dashboard</Link>
        <Link href="/dashboard/settings" className="sidebar-link block">⚙ Account Settings</Link>
      </nav>

      <div>
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Your Stores</p>
        <nav className="space-y-1">
          {stores.map((store) => {
            const href = `/dashboard/${store.id}`;
            const isActive = pathname.startsWith(href);

            return (
              <Link
                key={store.id}
                href={href}
                className={`store-link flex items-center p-2 rounded-md transition-colors ${
                  isActive 
                    ? "bg-indigo-50 text-indigo-600" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Store className="w-4 h-4 mr-3" />
                <span className="truncate text-sm">{store.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <Link
        href="/dashboard/create-store"
        className="bg-indigo-600 text-white w-full text-center block py-2 rounded-md hover:bg-indigo-700 transition"
      >
        + New Store
      </Link>
    </aside>
  );
}
