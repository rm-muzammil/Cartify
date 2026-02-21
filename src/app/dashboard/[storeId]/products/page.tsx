"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  images: string[];
  createdAt: string;
  totalSold?: number;
  revenue?: number;
}

export default function ProductsPage() {
  const { storeId } = useParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const limit = 10;

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/products?storeId=${storeId}&page=${page}&limit=${limit}&search=${search}`
      );
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  async function deleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <button
          onClick={() => router.push(`/dashboard/${storeId}/products/new`)}
          className="btn-primary"
        >
          + Add Product
        </button>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search products..."
          className="input flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {products.map((p) => (
            <div key={p.id} className="card space-y-2">
              {/* Image Carousel */}
              {p.images && p.images.length > 0 && (
                <div className="h-48 w-full overflow-hidden rounded-lg">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              <h2 className="text-lg font-semibold">{p.name}</h2>
              {p.description && <p className="text-sm text-gray-500">{p.description}</p>}

              <div className="flex justify-between text-sm mt-2">
                <span>Price: ${p.price}</span>
                <span>Stock: {p.stock}</span>
              </div>

              {p.totalSold !== undefined && (
                <div className="flex justify-between text-sm mt-1 text-green-600">
                  <span>Sold: {p.totalSold}</span>
                  <span>Revenue: ${p.revenue?.toFixed(2)}</span>
                </div>
              )}

              <div className="flex gap-2 mt-2">
                <button
                  className="btn-secondary flex-1"
                  onClick={() => router.push(`/dashboard/${storeId}/products/${p.id}/edit`)}
                >
                  Edit
                </button>
                <button
                  className="btn-danger flex-1"
                  onClick={() => deleteProduct(p.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          className="btn-secondary"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>
        <span className="px-3 py-1 rounded bg-gray-200">{page}</span>
        <button
          className="btn-secondary"
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
