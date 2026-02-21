"use client";

import { useState,use } from "react";

export default function LoginPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {storeId} = use(params)

  const login = async () => {
    const res = await fetch(
      `/api/store/${storeId}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      }
    );

    if (res.ok) {
      window.location.href = `/store/${storeId}`;
    } else {
      alert("Login failed");
    }
  };

  return (
    <div className="p-10 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Customer Login</h1>

      <input
        type="email"
        placeholder="Email"
        className="w-full border p-2 rounded"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2 rounded"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={login}
        className="bg-black text-white px-4 py-2 rounded w-full"
      >
        Login
      </button>
    </div>
  );
}
