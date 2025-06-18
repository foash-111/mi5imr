import { type NextRequest, NextResponse } from "next/server"
import { updateCommentStatus, deleteComment, getUserByEmail } from "@/backend/lib/db"
import { getServerSession } from "next-auth"

// PUT /api/comments/[id] - Update comment status (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {

		const awaitedParams = await params
    const session = await getServerSession()

    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email)

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await request.json()

    // Validate status
    if (!data.status || !["approved", "rejected"].includes(data.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update comment status
    const success = await updateCommentStatus(awaitedParams.id, data.status)

    if (!success) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating comment status:", error)
    return NextResponse.json({ error: "Failed to update comment status" }, { status: 500 })
  }
}

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email)

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete comment
    const success = await deleteComment(params.id)

    if (!success) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
