import { type NextRequest, NextResponse } from "next/server"
import { updateCommentStatus, deleteComment, updateCommentContent, canUserEditComment, canUserDeleteComment, getUserByEmail } from "@/backend/lib/db"
import { getServerSession } from "next-auth"

// PUT /api/comments/[id] - Update comment content or status
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params
    const session = await getServerSession()

    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const data = await request.json()

    // Check if this is a status update (admin only) or content update
    if (data.status) {
      // Status update - admin only
      if (!user.isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      // Validate status
      if (!["approved", "rejected"].includes(data.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }

      // Update comment status
      const success = await updateCommentStatus(awaitedParams.id, data.status)

      if (!success) {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 })
      }

      return NextResponse.json({ success: true })
    } else if (data.content) {
      // Content update - author or admin only
      const canEdit = await canUserEditComment(user._id!.toString(), awaitedParams.id)

      if (!canEdit) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      // Update comment content
      const success = await updateCommentContent(awaitedParams.id, data.content)

      if (!success) {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 })
      }

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Missing content or status" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error updating comment:", error)
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
  }
}

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params
    const session = await getServerSession()

    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user can delete this comment
    const canDelete = await canUserDeleteComment(user._id!.toString(), awaitedParams.id)

    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete comment
    const success = await deleteComment(awaitedParams.id)

    if (!success) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
