"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function submit() {
    await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(form),
    });

    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow w-full max-w-md space-y-4">

        <h2 className="text-2xl font-bold">Create Account</h2>

        <input className="input" placeholder="Name"
          onChange={e => setForm({ ...form, name: e.target.value })} />

        <input className="input" placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })} />

        <input className="input" type="password" placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })} />

        <button onClick={submit} className="btn-primary w-full">
          Register
        </button>

      </div>
    </div>
  );
}
