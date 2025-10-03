import GoogleProvider from "next-auth/providers/google";
import { getUserByEmail, createUser } from "@/backend/lib/db";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await getUserByEmail(user.email);
          if (!existingUser) {
            await createUser({
              name: user.name || "",
              username: user.email.split("@")[0],
              email: user.email,
              bio: "",
              avatar: user.image || undefined,
              isAdmin: user.email === process.env.ADMIN_EMAIL ? true : false,
              status: true,
              createdAt: new Date(),
            });
          }
          return true;
        } catch (error) {
          return false;
        }
      }
      return true;
    },
    async session({ session, token }: any) {
      if (session.user && session.user.email) {
        try {
          const dbUser = await getUserByEmail(session.user.email);
          if (dbUser) {
            session.user.id = dbUser._id?.toString() || "";
            session.user.isAdmin = dbUser.isAdmin;
            session.user.bio = dbUser.bio || "";
            session.user.avatar = dbUser.avatar || "";
            if (dbUser.createdAt) {
              const createdAt = dbUser.createdAt instanceof Date
                ? dbUser.createdAt
                : new Date(dbUser.createdAt);
              session.user.createdAt = createdAt.toISOString().split('T')[0];
            } else {
              session.user.createdAt = "";
            }
            session.user.username = dbUser.username || "";
            session.user.status = true;
            if (dbUser.email === process.env.ADMIN_EMAIL) {
              session.user.isAdmin = true;
            }
          }
        } catch (error) {}
      }
      return session;
    },
    async jwt({ token, user, account }: any) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.userId = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
}; 