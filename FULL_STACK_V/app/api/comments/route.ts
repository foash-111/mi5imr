import { type NextRequest, NextResponse } from "next/server"
import { getCommentsByContentId, createComment, getUserByEmail, createNotification } from "@/backend/lib/db"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import { getDb } from "@/backend/lib/db"

// GET /api/comments?contentId=123 - Get comments for a content
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    // Get user from database
    const user = session?.user?.email ? await getUserByEmail(session.user.email) : null;
    const userId = user?._id?.toString();
    const contentId = request.nextUrl.searchParams.get("contentId")

    if (!contentId) {
      return NextResponse.json({ error: "Content ID is required" }, { status: 400 })
    }

    const comments = await getCommentsByContentId(contentId, userId)
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

		console.log(" rote Creating comment for user:", user.email)
		console.log("route Comment data:", data)

    // Create comment
    const comment = await createComment({
      contentId: new ObjectId(data.contentId),
      userId: user._id!,
      userName: user.name,
      userAvatar: user.avatar,
      userEmail: user.email,
      parentId: data.parentId ? new ObjectId(data.parentId) : undefined,
      content: data.content,
      likes: 0,
      createdAt: new Date(),
      status: "approved", // Auto-approve all comments
    })

    // Notification logic for replies
    if (data.parentId) {
      try {
        const db = await getDb()
        const parentComment = await db.collection("comments").findOne({ _id: new ObjectId(data.parentId) })
        if (parentComment && parentComment.userId && parentComment.userId.toString() !== user._id!.toString()) {
          await createNotification({
            userId: parentComment.userId,
            type: 'comment_reply',
            commentId: parentComment._id,
            title: 'تم الرد على تعليقك',
            message: `قام ${user.name} بالرد على تعليقك`,
            isRead: false,
            createdAt: new Date(),
          })
        }
      } catch (e) {
        console.error('Failed to create reply notification:', e)
      }
    }

		console.log("route Comment created:", comment)

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
