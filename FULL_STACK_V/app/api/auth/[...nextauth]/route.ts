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
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        // Check if user exists in our database
        const existingUser = await getUserByEmail(user.email)
				// console.log("nextauth", user)

        if (!existingUser) {
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
        }

        return true
      }
      return false
    },
    async session({ session, token }) {
      if (session.user && session.user.email) {
        const dbUser = await getUserByEmail(session.user.email)
				// console.log("dbuser", dbUser)
        if (dbUser) {
          session.user.id = dbUser._id?.toString() || ""
          session.user.isAdmin = dbUser.isAdmin
					session.user.bio = dbUser.bio || ""
					session.user.avatar = dbUser.avatar || ""
					session.user.createdAt = dbUser.createdAt.toISOString().split('T')[0] || ""
					session.user.username = dbUser.username || ""
					session.user.status = true
					if (dbUser.email === process.env.ADMIN_EMAIL) {
						session.user.isAdmin = true
					}
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
