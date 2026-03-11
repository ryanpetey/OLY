import Link from "next/link";
import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function GroupsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: { group: true },
    orderBy: { joinedAt: "desc" }
  });

  return (
    <Shell>
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Your groups</h1>
        <Link href="/groups/new" className="inline-block rounded-xl bg-ink px-4 py-2 text-sm text-white">
          Create a group
        </Link>
        <div className="space-y-3">
          {memberships.map((membership) => (
            <Link key={membership.id} href={`/groups/${membership.group.id}`} className="card block">
              <p className="font-medium">{membership.group.name}</p>
              <p className="text-sm text-ink/60">{membership.group.description || "Private reflection circle"}</p>
            </Link>
          ))}
          {!memberships.length && <p className="text-sm text-ink/60">You are not in any groups yet.</p>}
        </div>
      </section>
    </Shell>
  );
}
