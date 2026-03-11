import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(50)
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (existing) {
          if (existing.name !== parsed.data.name) {
            return prisma.user.update({
              where: { id: existing.id },
              data: { name: parsed.data.name }
            });
          }
          return existing;
        }

        return prisma.user.create({
          data: {
            email: parsed.data.email,
            name: parsed.data.name
          }
        });
      }
    })
  ],
  pages: {
    signIn: "/signin"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  }
};

export const auth = () => getServerSession(authOptions);
