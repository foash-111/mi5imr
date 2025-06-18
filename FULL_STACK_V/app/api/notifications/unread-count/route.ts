import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getUnreadNotificationCount, getUserByEmail } from "@/backend/lib/db"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const count = await getUnreadNotificationCount(user._id!.toString())

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error fetching unread notification count:", error)
    return NextResponse.json({ error: "Failed to fetch unread count" }, { status: 500 })
  }
}
