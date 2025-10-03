import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getAllUsersWithActivity, blockUser, getUserByEmail } from "@/backend/lib/db"

// GET /api/users - Get all users with activity data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const users = await getAllUsersWithActivity()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// PUT /api/users - Block or unblock a user
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { userId, blocked } = await request.json()
    
    if (!userId || typeof blocked !== 'boolean') {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    const success = await blockUser(userId, blocked)
    
    if (!success) {
      return NextResponse.json({ error: "User not found or not updated" }, { status: 404 })
    }

    return NextResponse.json({ message: "User status updated" })
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 })
  }
} 