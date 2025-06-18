import { type NextRequest, NextResponse } from "next/server"
import { getCommentsByContentId, createComment, getUserByEmail } from "@/backend/lib/db"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"

// GET /api/comments?contentId=123 - Get comments for a content
export async function GET(request: NextRequest) {
  try {
    const contentId = request.nextUrl.searchParams.get("contentId")

    if (!contentId) {
      return NextResponse.json({ error: "Content ID is required" }, { status: 400 })
    }

    const comments = await getCommentsByContentId(contentId)
    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.contentId || !data.content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create comment
    const comment = await createComment({
      contentId: new ObjectId(data.contentId),
      userId: user._id!,
      userName: user.name,
      userAvatar: user.avatar,
      parentId: data.parentId ? new ObjectId(data.parentId) : undefined,
      content: data.content,
      likes: 0,
      createdAt: new Date(),
      status: user.isAdmin ? "approved" : "pending", // Auto-approve admin comments
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
