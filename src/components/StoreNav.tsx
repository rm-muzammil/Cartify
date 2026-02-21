"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function StoreNav() {
  const { storeId } = useParams();

  return (
    <div className="flex gap-4 border-b pb-3">

      <Link
        href={`/dashboard/${storeId}`}
        className="store-link"
      >
        🏠 Overview
      </Link>

      <Link
        href={`/dashboard/${storeId}/products`}
        className="store-link"
      >
        📦 Products
      </Link>

      <Link
        href={`/dashboard/${storeId}/orders`}
        className="store-link"
      >
        🧾 Orders
      </Link>

      <Link
        href={`/dashboard/${storeId}/analytics`}
        className="store-link"
      >
        📈 Analytics
      </Link>

      <Link
        href={`/dashboard/${storeId}/team`}
        className="store-link"
      >
        👥 Team
      </Link>

      <Link
        href={`/dashboard/${storeId}/settings`}
        className="store-link"
      >
        ⚙ Store Settings
      </Link>

    </div>
  );
}
