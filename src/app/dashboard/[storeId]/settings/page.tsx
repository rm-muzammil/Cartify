"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast"

export default function StoreSettingsPage() {
     const [confirm, setConfirm] = useState("")
  const { storeId } = useParams();
  const router = useRouter();

  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    async function fetchStore() {
      try {
        const res = await fetch(`/api/store/${storeId}`);
        const data = await res.json();
        setStore(data);
        setStoreName(data?.name ?? "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStore();
  }, [storeId]);

  async function updateStore() {
    try {
      const res = await fetch(`/api/store/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: storeName }),
      });

      if (!res.ok) throw new Error("Failed to update store");

      const updatedStore = await res.json();
      setStore(updatedStore);
      alert("Store updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update store.");
    }
  }

  async function deleteStore() {
 if (confirm !== store.name) {
      toast.error("Type store name correctly to confirm deletion")
      return
    }

    try {
      const res = await fetch(`/api/store/${store.id}`, {
        method: "DELETE"
      })

      if (!res.ok) throw new Error()

      toast.success("Store deleted successfully")
      router.push("/dashboard")

    } catch {
      toast.error("Failed to delete store")
    }
  }

  if (loading) return <p>Loading store settings...</p>;

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-3xl font-bold">Store Settings</h1>

      <label className="block">
        Store Name
        <input
          type="text"
          className="input"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
        />
      </label>

      <div className="flex gap-3">
        <button className="btn-primary" onClick={updateStore}>
          Update Store
        </button>

        <div className="border p-4 rounded-xl space-y-3">
      <p className="text-red-500 font-semibold">
        Type <b>{store.name}</b> to delete this store
      </p>

      <input
        className="border px-3 py-2 rounded w-full"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      <button
        onClick={deleteStore}
        className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={confirm !== store.name}
      >
        Delete Store Permanently
      </button>
    </div>
      </div>
    </div>
  );
}
