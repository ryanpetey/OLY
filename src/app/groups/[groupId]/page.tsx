import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { createInvite } from "@/app/actions";
import { Shell } from "@/components/shell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/utils";

export default async function GroupDashboard({ params }: { params: { groupId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: params.groupId, userId: session.user.id } }
  });
  if (!membership) redirect("/groups");

  const group = await prisma.group.findUnique({
    where: { id: params.groupId },
    include: {
      members: { include: { user: true }, orderBy: { joinedAt: "asc" } },
      inviteLinks: { orderBy: { createdAt: "desc" }, take: 1 },
      rounds: {
        take: 1,
        orderBy: { createdAt: "desc" },
        include: { responses: true, prompt: true }
      }
    }
  });

  if (!group) redirect("/groups");
  const latestRound = group.rounds[0];

  if (!latestRound) {
    return (
      <Shell>
        <section className="space-y-4">
          <div className="card space-y-2">
            <h1 className="text-2xl font-semibold">{group.name}</h1>
            <p className="text-sm text-ink/70">{group.description || "A private space for slow, thoughtful sharing."}</p>
            <p className="text-sm text-ink/60">No rounds yet. Create the first prompt round.</p>
          </div>
        </section>
      </Shell>
    );
  }

  const answeredIds = new Set(latestRound.responses.map((response) => response.userId));
  const roundHref =
    latestRound.status === "REVEALED" ? `/groups/${group.id}/round/reveal` : `/groups/${group.id}/round`;

  return (
    <Shell>
      <section className="space-y-4">
        <div className="card space-y-2">
          <h1 className="text-2xl font-semibold">{group.name}</h1>
          <p className="text-sm text-ink/70">{group.description || "A private space for slow, thoughtful sharing."}</p>
          <p className="text-xs text-ink/60">
            {latestRound.status === "ACTIVE"
              ? `Current prompt closes ${formatDistanceToNow(latestRound.closesAt, { addSuffix: true })}.`
              : "Current round has been revealed."}
          </p>
          <Link href={roundHref} className="inline-block rounded-xl bg-ink px-3 py-2 text-sm text-white">
            {latestRound.status === "ACTIVE" ? "Open current round" : "Open reveal"}
          </Link>
        </div>

        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Invite friends</h2>
            <form action={createInvite.bind(null, group.id)}>
              <button className="text-sm text-ink underline">Refresh link</button>
            </form>
          </div>
          {group.inviteLinks[0] && (
            <p className="break-all rounded-xl bg-ink/5 p-3 text-sm">{appUrl(`/join/${group.inviteLinks[0].token}`)}</p>
          )}
        </div>

        <div className="card">
          <h2 className="mb-2 font-semibold">Round progress</h2>
          <ul className="space-y-2 text-sm">
            {group.members.map((member) => (
              <li key={member.id} className="flex items-center justify-between rounded-xl bg-ink/5 px-3 py-2">
                <span>{member.user.name}</span>
                <span>{answeredIds.has(member.userId) ? "✅ Answered" : "⏳ Waiting"}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Shell>
  );
}
