import { joinGroup } from "@/app/actions";
import { Shell } from "@/components/shell";

export default function JoinGroupPage({ params }: { params: { token: string } }) {
  return (
    <Shell>
      <form action={joinGroup.bind(null, params.token)} className="card space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Join this private group</h1>
        <p className="text-sm text-ink/70">Once you join, you'll see the current round and can answer at your own pace.</p>
        <button className="w-full rounded-xl bg-ink py-2 text-sm font-medium text-white">Join group</button>
      </form>
    </Shell>
  );
}
