import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getUserByEmail } from "@/backend/lib/db"
import { getAnalyticsOverview, getViewsByDay, getLikesByDay, getCommentsByDay, getContentTypeDistribution,
  getTopUsersByPosts,
  getTopUsersByComments,
  getTopUsersByLikes,
  getTopUsersByViews,
  getTopUsersByEngagement
} from '@/backend/lib/analytics';

// GET /api/analytics - Get time-series analytics for dashboard charts
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
    const analytics = await getAnalyticsOverview()
    return NextResponse.json(analytics)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

// Views by day
export async function viewsByDayHandler(request: NextRequest) {
  try {
    const data = await getViewsByDay();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch views by day' }, { status: 500 });
  }
}

// Likes by day
export async function likesByDayHandler(request: NextRequest) {
  try {
    const data = await getLikesByDay();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch likes by day' }, { status: 500 });
  }
}

// Comments by day
export async function commentsByDayHandler(request: NextRequest) {
  try {
    const data = await getCommentsByDay();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments by day' }, { status: 500 });
  }
}

// Content type distribution
export async function contentTypeDistributionHandler(request: NextRequest) {
  try {
    const data = await getContentTypeDistribution();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch content type distribution' }, { status: 500 });
  }
}

// GET /api/analytics/top-users/posts
export async function GET_topUsersPosts(request: NextRequest) {
  try {
    const users = await getTopUsersByPosts(5);
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch top users by posts' }, { status: 500 });
  }
}

// GET /api/analytics/top-users/comments
export async function GET_topUsersComments(request: NextRequest) {
  try {
    const users = await getTopUsersByComments(5);
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch top users by comments' }, { status: 500 });
  }
}

// GET /api/analytics/top-users/likes
export async function GET_topUsersLikes(request: NextRequest) {
  try {
    const users = await getTopUsersByLikes(5);
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch top users by likes' }, { status: 500 });
  }
}

// GET /api/analytics/top-users/views
export async function GET_topUsersViews(request: NextRequest) {
  try {
    const users = await getTopUsersByViews(5);
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch top users by views' }, { status: 500 });
  }
}

// GET /api/analytics/top-users/engagement
export async function GET_topUsersEngagement(request: NextRequest) {
  try {
    const users = await getTopUsersByEngagement(5);
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch top users by engagement' }, { status: 500 });
  }
} 