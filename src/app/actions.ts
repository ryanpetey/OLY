"use server";

import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { addHours } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireDbUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const existing = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (existing) return existing;

  if (!session.user.email) {
    console.warn("[auth] Session user missing in DB and has no email; forcing re-auth", { userId: session.user.id });
    redirect("/signin");
  }

  try {
    const recreated = await prisma.user.create({
      data: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? "Friend"
      }
    });
    console.warn("[auth] Recreated missing user from session", { userId: recreated.id });
    return recreated;
  } catch {
    const byEmail = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (byEmail) {
      console.warn("[auth] Session user ID stale; recovered via email", { sessionUserId: session.user.id, recoveredUserId: byEmail.id });
      return byEmail;
    }

    redirect("/signin");
  }
}

async function pickPromptId() {
  const count = await prisma.prompt.count();
  const skip = Math.floor(Math.random() * Math.max(count, 1));
  const prompt = await prisma.prompt.findFirst({ skip });
  if (!prompt) throw new Error("No prompts found. Run seed script.");
  return prompt.id;
}

export async function createGroup(formData: FormData) {
  const user = await requireDbUser();
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
  const user = await requireDbUser();
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
  const user = await requireDbUser();
  const invite = await prisma.inviteLink.findUnique({ where: { token } });
  if (!invite) throw new Error("Invite not found");
  if (invite.expiresAt && invite.expiresAt < new Date()) throw new Error("Invite expired");

  try {
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: invite.groupId, userId: user.id } },
      update: {},
      create: {
        groupId: invite.groupId,
        userId: user.id
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      console.warn("[groups] FK constraint while joining group", {
        groupId: invite.groupId,
        userId: user.id,
        code: error.code
      });
      redirect("/groups");
    }
    throw error;
  }

  redirect(`/groups/${invite.groupId}`);
}

export async function submitResponse(groupId: string, roundId: string, formData: FormData) {
  const user = await requireDbUser();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) throw new Error("Response cannot be empty");

  await prisma.response.upsert({
    where: { roundId_userId: { roundId, userId: user.id } },
    update: { body },
    create: { roundId, userId: user.id, body }
  });

  await maybeRevealRound(groupId, roundId);

  const currentRound = await prisma.round.findUnique({
    where: { id: roundId },
    select: { status: true }
  });

  if (currentRound?.status === "REVEALED") {
    redirect(`/groups/${groupId}/round/reveal`);
  }

  redirect(`/groups/${groupId}/round`);
}

export async function maybeRevealRound(groupId: string, roundId: string) {
  await requireDbUser();
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
