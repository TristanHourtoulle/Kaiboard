import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { updateUserActivity } from "@/lib/user-activity";
// Remove PrismaAdapter import since it's not Edge Runtime compatible
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { prisma } from "./lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Remove adapter to use JWT sessions (Edge Runtime compatible)
  // adapter: PrismaAdapter(prisma),
  trustHost: true, // Trust the host in development
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/", // Redirect to homepage/dashboard which handles auth logic
  },
  session: {
    strategy: "jwt", // Use JWT instead of database sessions for Edge Runtime
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        // Make sure we have the user in our database
        const { prisma } = await import("./lib/prisma");
        
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              lastActiveAt: new Date(),
              // timezone defaults to "UTC" and country to null from schema
            },
          });
        } else {
          // Update last active time for existing user
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { lastActiveAt: new Date() }
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Get the user ID from the database and add it to the token
        const { prisma } = await import("./lib/prisma");
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (dbUser) {
          token.id = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
