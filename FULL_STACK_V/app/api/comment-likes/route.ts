import { type NextRequest, NextResponse } from "next/server"
import { likeComment, unlikeComment, isCommentLikedByUser, getUserByEmail, getUserLikes, createNotification, getContentById } from "@/backend/lib/db"
import { getServerSession } from "next-auth"
import { getDb } from "@/backend/lib/db"
import { ObjectId } from "mongodb"

// POST /api/comment-likes - Like or unlike comment
export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession()

		// Check if user is authenticated
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const data = await request.json()

		// Validate required fields
		if (!data.commentId) {
			return NextResponse.json({ error: "Comment ID is required" }, { status: 400 })
		}

		// Get user from database
		const user = await getUserByEmail(session.user.email)

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 })
		}

		const userId = user._id!.toString()
		const commentId = data.commentId

		// Check if already liked
		const isLiked = await isCommentLikedByUser(userId, commentId)
		// console.log("isliked route", isLiked)

		let success
		if (isLiked) {
			// Unlike
			success = await unlikeComment(userId, commentId)
			console.log("unlike success", success)
		} else {
			// Like
			success = await likeComment(userId, commentId)

			// Notification logic
			try {
				const db = await getDb()
				const comment = await db.collection("comments").findOne({ _id: new ObjectId(commentId) })
				if (comment && comment.userId && comment.userId.toString() !== userId) {
					// Get content to get the slug
					const content = await getContentById(comment.contentId.toString())
					
					await createNotification({
						userId: comment.userId,
						type: 'comment_liked',
						commentId: commentId,
						contentId: comment.contentId,
						slug: content?.slug,
						title: 'تم الإعجاب بتعليقك',
						message: `قام ${user.name} بالإعجاب بتعليقك`,
						isRead: false,
						createdAt: new Date(),
					})
				}
			} catch (e) {
				console.error('Failed to create like notification:', e)
			}
		}

		if (!success) {
			return NextResponse.json({ error: "Failed to update like status" }, { status: 500 })
		}

			// Fetch the updated like count
		const db = await getDb()
		const comment = await db.collection("comments").findOne({ _id: new ObjectId(commentId) })
		const likes = comment?.likes ?? 0

		// return NextResponse.json({ liked: !isLiked })
		return NextResponse.json({ liked: !isLiked, likes })
	} catch (error) {
		console.error("Error updating like status:", error)
		return NextResponse.json({ error: "Failed to update like status" }, { status: 500 })
	}
}
