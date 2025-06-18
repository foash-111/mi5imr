import { type NextRequest, NextResponse } from "next/server"
import { getAllUsers, getUserByEmail, getAllComments } from "@/backend/lib/db"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"

// GET /api/dashboard - Get all content with filters
export async function GET(request: NextRequest) {
  try {
    const users = await getAllUsers()
		const comments = await getAllComments()
    return NextResponse.json({users, comments})
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
