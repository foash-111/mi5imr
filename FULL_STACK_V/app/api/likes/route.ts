import { type NextRequest, NextResponse } from "next/server"
import { likeContent, unlikeContent, isContentLikedByUser, getUserByEmail, getUserLikes } from "@/backend/lib/db"
import { getServerSession } from "next-auth"

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

    let success
    if (isLiked) {
      // Unlike
      success = await unlikeContent(userId, contentId)
    } else {
      // Like
      success = await likeContent(userId, contentId)
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

// // GET /api/likes?contentId=123 - Check if user liked content
// export async function GET(request: NextRequest) {
//   try {
//     const session = await getServerSession()

//     // Check if user is authenticated
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const contentId = request.nextUrl.searchParams.get("contentId")

//     if (!contentId) {
//       return NextResponse.json({ error: "Content ID is required" }, { status: 400 })
//     }

//     // Get user from database
//     const user = await getUserByEmail(session.user.email)

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 })
//     }

//     const userId = user._id!.toString()

//     // Check if liked
//     const isLiked = await isContentLikedByUser(userId, contentId)

//     return NextResponse.json({ liked: isLiked })
//   } catch (error) {
//     console.error("Error checking like status:", error)
//     return NextResponse.json({ error: "Failed to check like status" }, { status: 500 })
//   }
// }


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
