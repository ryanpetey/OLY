import Link from "next/link";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-xl bg-gradient-to-b from-warm via-rose to-lilac px-4 pb-12 pt-6 text-ink">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-wide text-ink/70">
          OLY
        </Link>
        <nav className="flex gap-3 text-sm text-ink/70">
          <Link href="/groups">Groups</Link>
          <Link href="/groups/new">New</Link>
        </nav>
      </header>
      {children}
    </main>
  );
}
