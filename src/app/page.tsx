import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function LandingPage() {
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 py-12">
      <div className="card space-y-6">
        <p className="text-xs uppercase tracking-[0.22em] text-ink/50">Private group reflection</p>
        <h1 className="text-4xl font-semibold leading-tight">Make space for honest friendship, one prompt at a time.</h1>
        <p className="text-base text-ink/70">
          OLY helps small groups share thoughtful responses asynchronously. No feed. No noise. Just one meaningful round at a time.
        </p>
        <div className="flex gap-3">
          <Link href={session ? "/groups" : "/signin"} className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white">
            {session ? "Open your groups" : "Get started"}
          </Link>
        </div>
      </div>
    </main>
  );
}
