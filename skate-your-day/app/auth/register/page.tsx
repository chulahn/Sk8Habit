"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Registration failed');
        return;
      }
      router.push('/auth/signin');
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      {mounted ? (
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <input defaultValue={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" className="p-2 rounded bg-slate-800" />
          <input defaultValue={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="p-2 rounded bg-slate-800" />
          <input defaultValue={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="p-2 rounded bg-slate-800" />
          {error ? <div className="text-red-400 text-sm">{error}</div> : null}
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-600 rounded">Create account</button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
