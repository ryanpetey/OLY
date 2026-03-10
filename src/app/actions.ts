"use server";

import crypto from "crypto";
import { addHours } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  return session.user;
}

async function pickPromptId() {
  const count = await prisma.prompt.count();
  const skip = Math.floor(Math.random() * Math.max(count, 1));
  const prompt = await prisma.prompt.findFirst({ skip });
  if (!prompt) throw new Error("No prompts found. Run seed script.");
  return prompt.id;
}

export async function createGroup(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) throw new Error("Group name is required");

  const promptId = await pickPromptId();

  const group = await prisma.group.create({
    data: {
      name,
      description,
      members: { create: { userId: user.id, role: "ADMIN" } },
      rounds: {
        create: {
          promptId,
          closesAt: addHours(new Date(), 72)
        }
      },
      inviteLinks: {
        create: {
          token: crypto.randomBytes(16).toString("hex"),
          createdById: user.id,
          expiresAt: addHours(new Date(), 24 * 30)
        }
      }
    }
  });

  redirect(`/groups/${group.id}`);
}

export async function createInvite(groupId: string) {
  const user = await requireUser();
  await prisma.inviteLink.create({
    data: {
      groupId,
      createdById: user.id,
      token: crypto.randomBytes(16).toString("hex"),
      expiresAt: addHours(new Date(), 24 * 30)
    }
  });
  revalidatePath(`/groups/${groupId}`);
}

export async function joinGroup(token: string) {
  const user = await requireUser();
  const invite = await prisma.inviteLink.findUnique({ where: { token } });
  if (!invite) throw new Error("Invite not found");
  if (invite.expiresAt && invite.expiresAt < new Date()) throw new Error("Invite expired");

  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: invite.groupId, userId: user.id } },
    update: {},
    create: {
      groupId: invite.groupId,
      userId: user.id
    }
  });

  redirect(`/groups/${invite.groupId}`);
}

export async function submitResponse(groupId: string, roundId: string, formData: FormData) {
  const user = await requireUser();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) throw new Error("Response cannot be empty");

  await prisma.response.upsert({
    where: { roundId_userId: { roundId, userId: user.id } },
    update: { body },
    create: { roundId, userId: user.id, body }
  });

  const status = await maybeRevealRound(groupId, roundId);
  if (status === "REVEALED") {
    redirect(`/groups/${groupId}/round/reveal`);
  }

  redirect(`/groups/${groupId}/round`);
}

export async function maybeRevealRound(groupId: string, roundId: string) {
  await requireUser();
  const [memberCount, responseCount, round] = await Promise.all([
    prisma.groupMember.count({ where: { groupId } }),
    prisma.response.count({ where: { roundId } }),
    prisma.round.findUnique({ where: { id: roundId } })
  ]);

  if (!round) return null;
  if (round.status === "REVEALED") return "REVEALED";

  const deadlinePassed = round.closesAt <= new Date();
  if (responseCount >= memberCount || deadlinePassed) {
    await prisma.round.update({
      where: { id: roundId },
      data: { status: "REVEALED", revealedAt: new Date() }
    });

    revalidatePath(`/groups/${groupId}`);
    revalidatePath(`/groups/${groupId}/round`);
    revalidatePath(`/groups/${groupId}/round/reveal`);
    return "REVEALED";
  }

  revalidatePath(`/groups/${groupId}`);
  revalidatePath(`/groups/${groupId}/round`);
  revalidatePath(`/groups/${groupId}/round/reveal`);
  return "ACTIVE";
}
