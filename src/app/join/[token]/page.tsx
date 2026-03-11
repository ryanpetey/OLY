import Link from "next/link";
import { redirect } from "next/navigation";
import { joinGroup } from "@/app/actions";
import { Shell } from "@/components/shell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function JoinGroupPage({ params }: { params: { token: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(`/join/${params.token}`)}`);
  }

  const invite = await prisma.inviteLink.findUnique({
    where: { token: params.token },
    include: { group: true }
  });

  if (!invite) {
    return (
      <Shell>
        <section className="card space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Invite link not found</h1>
          <p className="text-sm text-ink/70">This invite may be invalid or already removed.</p>
          <Link href="/groups" className="inline-block rounded-xl bg-ink px-4 py-2 text-sm text-white">
            Go to your groups
          </Link>
        </section>
      </Shell>
    );
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return (
      <Shell>
        <section className="card space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Invite link expired</h1>
          <p className="text-sm text-ink/70">Ask the group admin to generate a new invite link.</p>
          <Link href="/groups" className="inline-block rounded-xl bg-ink px-4 py-2 text-sm text-white">
            Go to your groups
          </Link>
        </section>
      </Shell>
    );
  }

  return (
    <Shell>
      <form action={joinGroup.bind(null, params.token)} className="card space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Join {invite.group.name}</h1>
        <p className="text-sm text-ink/70">Once you join, you'll see the current round and can answer at your own pace.</p>
        <button className="w-full rounded-xl bg-ink py-2 text-sm font-medium text-white">Join group</button>
      </form>
    </Shell>
  );
}
