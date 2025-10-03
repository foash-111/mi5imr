import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getContentWithDetailedStats, getUserByEmail } from "@/backend/lib/db"

// GET /api/content/stats - Get content with detailed statistics
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

    const contentWithStats = await getContentWithDetailedStats()
    return NextResponse.json(contentWithStats)
  } catch (error) {
    console.error("Error fetching content stats:", error)
    return NextResponse.json({ error: "Failed to fetch content statistics" }, { status: 500 })
  }
} 