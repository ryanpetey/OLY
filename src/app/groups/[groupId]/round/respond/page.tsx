import { notFound, redirect } from "next/navigation";
import { submitResponse } from "@/app/actions";
import { Shell } from "@/components/shell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SubmitResponsePage({ params }: { params: { groupId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const round = await prisma.round.findFirst({
    where: { groupId: params.groupId, status: "ACTIVE" },
    include: { prompt: true },
    orderBy: { createdAt: "desc" }
  });

  if (!round) notFound();

  return (
    <Shell>
      <form action={submitResponse.bind(null, params.groupId, round.id)} className="card space-y-4">
        <h1 className="text-xl font-semibold">Respond to this round</h1>
        <p className="rounded-xl bg-ink/5 p-3 text-sm">{round.prompt.text}</p>
        <textarea
          name="body"
          rows={7}
          required
          maxLength={1200}
          className="w-full rounded-xl border border-ink/15 px-3 py-2"
          placeholder="Share honestly. Keep it human and simple."
        />
        <button className="w-full rounded-xl bg-ink py-2 text-sm font-medium text-white">Save response</button>
      </form>
    </Shell>
  );
}
