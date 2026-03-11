import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CurrentRoundPage({ params }: { params: { groupId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: params.groupId, userId: session.user.id } }
  });
  if (!member) notFound();

  const round = await prisma.round.findFirst({
    where: { groupId: params.groupId, status: "ACTIVE" },
    include: {
      prompt: true,
      responses: { where: { userId: session.user.id } }
    },
    orderBy: { createdAt: "desc" }
  });

  if (!round) notFound();
  const myResponse = round.responses[0];

  return (
    <Shell>
      <article className="card space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Current prompt</p>
        <h1 className="text-2xl leading-tight">{round.prompt.text}</h1>
        <p className="text-sm text-ink/60">Category: {round.prompt.category} · Intimacy: {round.prompt.intimacyLevel}/100</p>
        {myResponse ? (
          <div className="rounded-xl bg-ink/5 p-3 text-sm">
            <p className="mb-1 font-medium">Your response is in.</p>
            <p className="text-ink/70">You can edit it until reveal. Responses unlock when everyone answers or the round closes.</p>
          </div>
        ) : (
          <Link href={`/groups/${params.groupId}/round/respond`} className="inline-block rounded-xl bg-ink px-4 py-2 text-sm text-white">
            Write your response
          </Link>
        )}
        <Link href={`/groups/${params.groupId}/round/reveal`} className="block text-sm text-ink underline">
          Go to reveal page
        </Link>
      </article>
    </Shell>
  );
}
