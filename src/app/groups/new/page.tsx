import { Shell } from "@/components/shell";
import { createGroup } from "@/app/actions";

export default function CreateGroupPage() {
  return (
    <Shell>
      <form action={createGroup} className="card space-y-4">
        <h1 className="text-2xl font-semibold">Create a private group</h1>
        <label className="block text-sm">
          Group name
          <input name="name" required className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2" placeholder="Sunday circle" />
        </label>
        <label className="block text-sm">
          Description (optional)
          <textarea name="description" rows={3} className="mt-1 w-full rounded-xl border border-ink/15 px-3 py-2" placeholder="A warm place for honest check-ins." />
        </label>
        <button className="w-full rounded-xl bg-ink py-2 text-sm font-medium text-white">Create group</button>
      </form>
    </Shell>
  );
}
