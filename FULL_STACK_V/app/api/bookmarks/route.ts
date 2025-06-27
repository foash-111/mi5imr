import { type NextRequest, NextResponse } from "next/server"
import {
  bookmarkContent,
  unbookmarkContent,
  isContentBookmarkedByUser,
  getUserBookmarks,
  getUserByEmail,
} from "@/backend/lib/db"
import { getServerSession } from "next-auth"

// POST /api/bookmarks - Bookmark or unbookmark content
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

    // Check if already bookmarked
    const isBookmarked = await isContentBookmarkedByUser(userId, contentId)

    let success
    if (isBookmarked) {
      // Unbookmark
      success = await unbookmarkContent(userId, contentId)
    } else {
      // Bookmark
      success = await bookmarkContent(userId, contentId)
    }

    if (!success) {
      return NextResponse.json({ error: "Failed to update bookmark status" }, { status: 500 })
    }

    return NextResponse.json({ bookmarked: !isBookmarked })
  } catch (error) {
    console.error("Error updating bookmark status:", error)
    return NextResponse.json({ error: "Failed to update bookmark status" }, { status: 500 })
  }
}

// GET /api/bookmarks - Get user bookmarks
export async function GET(request: NextRequest) {
  try {
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

    const userId = user._id!.toString()
	  const contentId = request.nextUrl.searchParams.get("contentId");

    // Get bookmarks
		if (contentId) {
			// Handle specific content saved check
			const isSaved = await isContentBookmarkedByUser(userId, contentId);
			console.log("Content savd status in routes:", isSaved);
			return NextResponse.json({ saved: isSaved });
		} else {
			// Handle fetching all Saved content
			const bookmarks = await getUserBookmarks(userId)
			return NextResponse.json(bookmarks);
		}
  } catch (error) {
    console.error("Error fetching bookmarks:", error)
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 })
  }
}
