import { notFound, redirect } from "next/navigation";
import { maybeRevealRound } from "@/app/actions";
import { Shell } from "@/components/shell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function RevealPage({ params }: { params: { groupId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: params.groupId, userId: session.user.id } }
  });
  if (!member) notFound();

  const round = await prisma.round.findFirst({
    where: { groupId: params.groupId },
    include: {
      prompt: true,
      responses: { include: { user: true }, orderBy: { createdAt: "asc" } },
      group: { include: { members: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  if (!round) redirect(`/groups/${params.groupId}`);

  const status = round.status === "ACTIVE" ? await maybeRevealRound(params.groupId, round.id) : "REVEALED";

  const refreshed = await prisma.round.findUnique({
    where: { id: round.id },
    include: {
      prompt: true,
      responses: { include: { user: true }, orderBy: { createdAt: "asc" } },
      group: { include: { members: true } }
    }
  });

  if (!refreshed) redirect(`/groups/${params.groupId}`);
  const canReveal = status === "REVEALED" || refreshed.status === "REVEALED";

  return (
    <Shell>
      <section className="space-y-4">
        <div className="card space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Reveal</p>
          <h1 className="text-2xl leading-tight">{refreshed.prompt.text}</h1>
          {!canReveal && (
            <p className="text-sm text-ink/70">
              Waiting for reveal condition. {refreshed.responses.length}/{refreshed.group.members.length} members have answered.
            </p>
          )}
        </div>

        {canReveal &&
          refreshed.responses.map((response) => (
            <article key={response.id} className="card space-y-2">
              <p className="text-sm font-medium text-ink/70">{response.user.name}</p>
              <p className="whitespace-pre-wrap leading-relaxed">{response.body}</p>
            </article>
          ))}
      </section>
    </Shell>
  );
}
