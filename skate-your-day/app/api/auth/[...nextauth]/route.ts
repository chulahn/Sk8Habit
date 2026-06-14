import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcrypt";

type SessionUserWithId = {
  id?: string;
};

type TokenWithId = JWT & {
  id?: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { email, password } = credentials as { email: string; password: string };
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          // Log failed login attempt (user not found)
          try {
            await prisma.failedLoginAttempt.create({
              data: { email, userId: 0 },
            });
          } catch {
            // Ignore if user doesn't exist for FK constraint
          }
          return null;
        }
        const isValid = await compare(password, user.password);
        if (!isValid) {
          // Log failed login attempt (wrong password)
          await prisma.failedLoginAttempt.create({
            data: { email, userId: user.id },
          });
          return null;
        }
        // Log successful login
        await prisma.loginHistory.create({
          data: { userId: user.id },
        });
        return { id: String(user.id), name: user.name ?? null, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) (token as TokenWithId).id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as SessionUserWithId).id = (token as TokenWithId).id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
