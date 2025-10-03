import { type NextRequest, NextResponse } from "next/server"
import { likeContent, unlikeContent, isContentLikedByUser, getUserByEmail, getUserLikes, createNotification, getContentById } from "@/backend/lib/db"
import { getServerSession } from "next-auth"
import { getDb } from "@/backend/lib/db"
import { ObjectId } from "mongodb"

// POST /api/likes - Like or unlike content
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.contentId) {
      return NextResponse.json({ error: "Content ID is required" }, { status: 400 })
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = user._id!.toString()
    const contentId = data.contentId

    // Check if already liked
    const isLiked = await isContentLikedByUser(userId, contentId)
		console.log("isliked route", isLiked)

    let success
    if (isLiked) {
      // Unlike
      success = await unlikeContent(userId, contentId)
			console.log("unlike success", success)
    } else {
      // Like
      success = await likeContent(userId, contentId)

      // Notification logic for content author
      try {
        const content = await getContentById(contentId)
        console.log("Content author check:", {
          contentAuthorId: content?.author._id?.toString(),
          currentUserId: userId,
          contentTitle: content?.title,
          isDifferentUser: content?.author._id?.toString() !== userId,
          contentAuthorName: content?.author.name,
          currentUserName: user.name
        })
        
        if (content && content.author._id && content.author._id.toString() !== userId) {
          console.log("Creating notification for content author:", content.author._id.toString())
          await createNotification({
            userId: content.author._id,
            type: 'content_like',
            contentId: contentId,
            slug: content.slug,
            title: 'تم الإعجاب بمحتواك',
            message: `قام ${user.name} بالإعجاب بمحتواك: ${content.title}`,
            isRead: false,
            createdAt: new Date(),
          })
          console.log("Notification created successfully for content like")
        } else {
          console.log("No notification created - same user or missing author")
        }
      } catch (e) {
        console.error('Failed to create content like notification:', e)
      }
    }

    if (!success) {
      return NextResponse.json({ error: "Failed to update like status" }, { status: 500 })
    }

    return NextResponse.json({ liked: !isLiked })
  } catch (error) {
    console.error("Error updating like status:", error)
    return NextResponse.json({ error: "Failed to update like status" }, { status: 500 })
  }
}


// GET /api/likes?contentId=123 - Check if user liked specific content
// GET /api/likes - Get all content liked by the user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user._id!.toString();
    const contentId = request.nextUrl.searchParams.get("contentId");

    if (contentId) {
      // Handle specific content like check
      const isLiked = await isContentLikedByUser(userId, contentId);
			//console.log("Content liked status in routes:", isLiked);
      return NextResponse.json({ liked: isLiked });
    } else {
      // Handle fetching all liked content
      const likedContent = await getUserLikes(userId);
      return NextResponse.json(likedContent);
    }
  } catch (error) {
    console.error("Error handling likes request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
