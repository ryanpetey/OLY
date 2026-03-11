"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const name = String(form.get("name") ?? "");

    const result = await signIn("credentials", { email, name, redirect: false, callbackUrl: "/groups" });
    if (!result || result.error) {
      setError("We couldn't sign you in. Check your details and try again.");
      setLoading(false);
      return;
    }

    window.location.href = result.url ?? "/groups";
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-6 py-10">
      <form onSubmit={onSubmit} className="card space-y-4">
        <h1 className="text-2xl font-semibold">Welcome to OLY</h1>
        <p className="text-sm text-ink/70">Use your name and email to continue. This is intentionally simple for MVP.</p>
        <label className="block text-sm">
          Name
          <input name="name" required className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2" />
        </label>
        <label className="block text-sm">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2" />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="w-full rounded-xl bg-ink py-2 text-sm font-medium text-white disabled:opacity-70">
          {loading ? "Signing in..." : "Continue"}
        </button>
      </form>
    </main>
  );
}
