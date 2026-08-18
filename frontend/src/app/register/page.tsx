"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // Match backend RegisterDto validation
    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            password,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message[0]
          : data?.message;

        throw new Error(
          message || "Registration failed.",
        );
      }

      // Registration successful
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Registration failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-8 shadow-sm">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-base-content">
              Create an account
            </h1>

            <p className="mt-2 text-sm text-base-content/60">
              Create your account to start managing tasks.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-base-content"
              >
                Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter your name"
                autoComplete="name"
                disabled={loading}
                className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 text-sm text-base-content outline-none placeholder:text-base-content/40 focus:border-base-content/40 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-base-content"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 text-sm text-base-content outline-none placeholder:text-base-content/40 focus:border-base-content/40 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-base-content"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 text-sm text-base-content outline-none placeholder:text-base-content/40 focus:border-base-content/40 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                loading ||
                name.trim().length < 2 ||
                !email.trim() ||
                password.length < 6
              }
              className="w-full rounded-lg bg-base-content px-4 py-2.5 text-sm font-medium text-base-100 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-base-content/60">
            Already have an account?{" "}

            <Link
              href="/login"
              className="font-medium text-base-content hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}