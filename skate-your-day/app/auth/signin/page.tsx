"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [tab, setTab] = useState<"signin" | "register">("signin");
  
  // Sign in
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Register
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", { redirect: false, email, password });
    // @ts-ignore
    if (res?.error) {
      setError(res.error as string);
    } else {
      router.push("/");
    }
  };

  const onRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regEmail || !regPassword || !regConfirmPassword) {
      setRegError("All fields are required");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match");
      return;
    }

    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, password: regPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegError(data.error || "Registration failed");
        return;
      }

      setRegSuccess("Registration successful! Signing you in...");
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");

      // Auto sign in
      setTimeout(async () => {
        const signInRes = await signIn("credentials", {
          redirect: false,
          email: regEmail,
          password: regPassword,
        });
        // @ts-ignore
        if (!signInRes?.error) {
          router.push("/");
        }
      }, 1000);
    } catch (err) {
      setRegError("An error occurred during registration");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-600">
          <button
            onClick={() => setTab("signin")}
            className={`flex-1 py-2 px-4 text-center font-semibold transition-colors ${
              tab === "signin"
                ? "border-b-2 border-blue-600 text-slate-100"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-2 px-4 text-center font-semibold transition-colors ${
              tab === "register"
                ? "border-b-2 border-blue-600 text-slate-100"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Register
          </button>
        </div>

        {/* Sign In Form */}
        {tab === "signin" && mounted ? (
          <form onSubmit={onSignInSubmit} className="flex flex-col gap-3">
            <h2 className="text-xl font-bold mb-4 text-center">Sign In</h2>
            <input
              defaultValue={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 rounded bg-slate-800 text-slate-100 placeholder-slate-500"
            />
            <input
              defaultValue={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="w-full p-3 rounded bg-slate-800 text-slate-100 placeholder-slate-500"
            />
            {error ? <div className="text-red-400 text-sm text-center">{error}</div> : null}
            <button type="submit" className="w-full px-4 py-2 bg-blue-600 rounded font-semibold hover:bg-blue-700">
              Sign In
            </button>
          </form>
        ) : null}

        {/* Register Form */}
        {tab === "register" && mounted ? (
          <form onSubmit={onRegisterSubmit} className="flex flex-col gap-3">
            <h2 className="text-xl font-bold mb-4 text-center">Create Account</h2>
            <input
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 rounded bg-slate-800 text-slate-100 placeholder-slate-500"
            />
            <input
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="w-full p-3 rounded bg-slate-800 text-slate-100 placeholder-slate-500"
            />
            <input
              value={regConfirmPassword}
              onChange={(e) => setRegConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              type="password"
              className="w-full p-3 rounded bg-slate-800 text-slate-100 placeholder-slate-500"
            />
            {regError ? <div className="text-red-400 text-sm text-center">{regError}</div> : null}
            {regSuccess ? <div className="text-green-400 text-sm text-center">{regSuccess}</div> : null}
            <button type="submit" className="w-full px-4 py-2 bg-green-600 rounded font-semibold hover:bg-green-700">
              Register
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
