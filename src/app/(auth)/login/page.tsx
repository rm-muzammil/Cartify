"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/onboarding");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow w-full max-w-md space-y-4">

        <h2 className="text-2xl font-bold">Login</h2>

        <input className="input" placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

        <button onClick={submit} className="btn-primary w-full">
          Login
        </button>

      </div>
    </div>
  );
}
