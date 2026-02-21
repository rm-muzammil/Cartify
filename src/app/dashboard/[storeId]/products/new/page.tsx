"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function NewProductPage() {
  const { storeId } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
  });

async function submit() {
  await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      storeId,                 // ✅ IMPORTANT
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock),
    }),
  });

  router.push(`/dashboard/${storeId}/products`);
}


  return (
    <div className="max-w-lg space-y-4">

      <h1 className="text-2xl font-bold">Add Product</h1>

      <input
        placeholder="Product name"
        className="input"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder="Price"
        type="number"
        className="input"
        value={form.price}
        onChange={e => setForm({ ...form, price: e.target.value })}
      />

      <input
        placeholder="Stock"
        type="number"
        className="input"
        value={form.stock}
        onChange={e => setForm({ ...form, stock: e.target.value })}
      />

      <button onClick={submit} className="btn-primary">
        Save Product
      </button>

    </div>
  );
}
