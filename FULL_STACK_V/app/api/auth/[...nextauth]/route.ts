import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { getUserByEmail, createUser } from "@/backend/lib/db"

declare module "next-auth" {
  interface User {
    id?: string
    name?: string
		username?: string
    email?: string
    avatar?: string
		status?: boolean
    isAdmin?: boolean
    bio?: string
    createdAt?: string
  }

  interface Session {
    user: User
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("NextAuth signIn callback:", { 
        user: user?.email, 
        provider: account?.provider,
        hasProfile: !!profile 
      });
      
      if (account?.provider === "google" && user.email) {
        try {
          // Check if user exists in our database
          const existingUser = await getUserByEmail(user.email)
          console.log("Existing user check:", existingUser ? "Found" : "Not found");

          if (!existingUser) {
            console.log("Creating new user:", user.email);
            // Create new user
            await createUser({
              name: user.name || "",
              username: user.email.split("@")[0],
              email: user.email,
              bio: "",
              avatar: user.image || undefined,
              isAdmin: user.email === process.env.ADMIN_EMAIL? true : false, // Default to non-admin
              status: true,
              createdAt: new Date(),
            })
            console.log("New user created successfully");
          } else {
            console.log("User already exists, updating session");
          }

          return true
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false
        }
      }
      
      // For existing sessions or other cases, don't log as error
      console.log("SignIn callback: Not a new Google sign-in");
      return true // Allow existing sessions to continue
    },
    async session({ session, token }) {
      console.log("NextAuth session callback:", { 
        userEmail: session.user?.email,
        tokenSub: token.sub 
      });
      
      if (session.user && session.user.email) {
        try {
          const dbUser = await getUserByEmail(session.user.email)
          console.log("DB user found:", dbUser ? "Yes" : "No");
          
          if (dbUser) {
            session.user.id = dbUser._id?.toString() || ""
            session.user.isAdmin = dbUser.isAdmin
            session.user.bio = dbUser.bio || ""
            session.user.avatar = dbUser.avatar || ""
            // Handle createdAt properly - it might be a string or Date object
            if (dbUser.createdAt) {
              const createdAt = dbUser.createdAt instanceof Date 
                ? dbUser.createdAt 
                : new Date(dbUser.createdAt)
              session.user.createdAt = createdAt.toISOString().split('T')[0]
            } else {
              session.user.createdAt = ""
            }
            session.user.username = dbUser.username || ""
            session.user.status = true
            if (dbUser.email === process.env.ADMIN_EMAIL) {
              session.user.isAdmin = true
            }
            console.log("Session updated with user data");
          }
        } catch (error) {
          console.error("Error in session callback:", error);
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account && user) {
        console.log("JWT callback: New sign-in");
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})

export { handler as GET, handler as POST }
