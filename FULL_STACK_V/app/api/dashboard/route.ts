import { type NextRequest, NextResponse } from "next/server"
import { getAllUsers, getUserByEmail, getAllComments, getAllContent, getContentTypes, getCategories, getActiveSubscribers, getDashboardStats as getDashboardStatsDb, seedTestContentData, getContentCounts, getContentTypeDistribution as getContentTypeDistributionDb } from "@/backend/lib/db"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"

// GET /api/dashboard - Get comprehensive analytics data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    // Check if user is authenticated and is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByEmail(session.user.email)
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Fetch all data in parallel for better performance
    const [
      users,
      comments,
      contentCounts,
      contentTypeDist,
      contentTypes,
      categories,
      subscribers,
      contentData
    ] = await Promise.all([
      getAllUsers(),
      getAllComments(),
      getContentCounts(),
      getContentTypeDistributionDb(),
      getContentTypes(),
      getCategories(),
      getActiveSubscribers(),
      getAllContent({ limit: 20 }) // Only fetch a small set for previews/top/recent
    ])

    const { content } = contentData

    // Calculate analytics
    const analytics = {
      // User Analytics
      users: {
        total: users.length,
        active: users.filter(u => u.isActive !== false).length,
        admins: users.filter(u => u.isAdmin).length,
        newThisMonth: users.filter(u => {
          const userDate = new Date(u.createdAt)
          const now = new Date()
          return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
        }).length,
        growthRate: calculateGrowthRate(users, 'createdAt')
      },

      // Content Analytics
      content: {
        ...contentCounts,
        byType: contentTypeDist,
        byCategory: categories.map(cat => ({
          name: cat.label,
          count: content.filter(c => c.categories?.some(category => category.label === cat.label)).length
        })),
        topContent: getTopContent(content),
        recentContent: content
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
      },

      // Engagement Analytics
      engagement: {
        totalComments: comments.length,
        approvedComments: comments.filter(c => c.status === 'approved').length,
        pendingComments: comments.filter(c => c.status === 'pending').length,
        rejectedComments: comments.filter(c => c.status === 'rejected').length,
        totalLikes: calculateTotalLikes(content),
        totalViews: calculateTotalViews(content),
        averageEngagement: calculateAverageEngagement(content),
        topEngagedContent: getTopEngagedContent(content)
      },

      // Newsletter Analytics
      newsletter: {
        totalSubscribers: subscribers.length,
        activeSubscribers: subscribers.filter(s => s.isActive).length,
        newSubscribersThisMonth: subscribers.filter(s => {
          const subDate = new Date(s.subscribedAt)
          const now = new Date()
          return subDate.getMonth() === now.getMonth() && subDate.getFullYear() === now.getFullYear()
        }).length
      },

      // Time-based Analytics
      timeSeries: {
        contentCreated: getTimeSeriesData(content, 'createdAt'),
        userRegistrations: getTimeSeriesData(users, 'createdAt'),
        commentsPosted: getTimeSeriesData(comments, 'createdAt')
      },

      // Daily Analytics
      viewsByDay: getViewsByDay(content),
      likesByDay: getTimeSeriesData((content as any[]).flatMap(c => Array((c.likesCount || 0)).fill({ createdAt: c.createdAt })), 'createdAt'),
      commentsByDay: getTimeSeriesData(comments, 'createdAt'),
      avgLovesAndCommentsByDay: getAvgLovesAndCommentsByDay(content, comments),

      // Content Type Distribution
      contentTypeDistribution: contentTypeDist,

      // Performance Metrics
      performance: {
        contentViewsPerDay: calculateViewsPerDay(content),
        engagementRate: calculateEngagementRate(content),
        commentApprovalRate: comments.length > 0 ? 
          (comments.filter(c => c.status === 'approved').length / comments.length) * 100 : 0
      }
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}

// GET /api/dashboard - Get overall dashboard statistics
export async function getDashboardStats(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const user = await getUserByEmail(session.user.email)
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    const dashboardStats = await getDashboardStatsDb()
    return NextResponse.json(dashboardStats)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}

// Add a temporary endpoint to seed test data
export async function GET_seedTestData() {
  const result = await seedTestContentData();
  return NextResponse.json(result);
}

// Helper functions for analytics calculations
function calculateGrowthRate(data: any[], dateField: string): number {
  if (data.length < 2) return 0
  
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const lastMonthCount = data.filter(item => {
    const itemDate = new Date(item[dateField])
    return itemDate >= lastMonth && itemDate < thisMonth
  }).length
  
  const thisMonthCount = data.filter(item => {
    const itemDate = new Date(item[dateField])
    return itemDate >= thisMonth
  }).length
  
  if (lastMonthCount === 0) return thisMonthCount > 0 ? 100 : 0
  return ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100
}

function getTopContent(content: any[]): any[] {
  return content
    .filter(c => c.published)
    .sort((a, b) => {
      const aScore = (a.viewCount || 0) + (a.likesCount || 0) * 2 + (a.commentsCount || 0) * 3
      const bScore = (b.viewCount || 0) + (b.likesCount || 0) * 2 + (b.commentsCount || 0) * 3
      return bScore - aScore
    })
    .slice(0, 10)
    .map(c => ({
      id: c._id,
      title: c.title,
      views: c.viewCount || 0,
      likes: c.likesCount || 0,
      comments: c.commentsCount || 0,
      score: (c.viewCount || 0) + (c.likesCount || 0) * 2 + (c.commentsCount || 0) * 3
    }))
}

function getTopEngagedContent(content: any[]): any[] {
  return content
    .filter(c => c.published)
    .map(c => ({
      id: c._id,
      title: c.title,
      engagementRate: calculateContentEngagementRate(c),
      views: c.viewCount || 0,
      likes: c.likesCount || 0,
      comments: c.commentsCount || 0
    }))
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 10)
}

function calculateTotalLikes(content: any[]): number {
  return content.reduce((total, c) => total + (c.likesCount || 0), 0)
}

function calculateTotalViews(content: any[]): number {
  return content.reduce((total, c) => total + (c.viewCount || 0), 0)
}

function calculateAverageEngagement(content: any[]): number {
  const publishedContent = content.filter(c => c.published)
  if (publishedContent.length === 0) return 0
  const totalEngagement = publishedContent.reduce((total, c) => {
    return total + (c.likesCount || 0) + (c.commentsCount || 0)
  }, 0)
  return totalEngagement / publishedContent.length
}

function calculateContentEngagementRate(content: any): number {
  const views = content.viewCount || 0
  if (views === 0) return 0
  const engagement = (content.likesCount || 0) + (content.commentsCount || 0)
  return (engagement / views) * 100
}

function calculateViewsPerDay(content: any[]): number {
  const publishedContent = content.filter(c => c.published)
  if (publishedContent.length === 0) return 0
  const totalViews = calculateTotalViews(publishedContent)
  const oldestContent = publishedContent.reduce((oldest, c) => {
    const contentDate = new Date(c.createdAt)
    return contentDate < oldest ? contentDate : oldest
  }, new Date())
  const daysSinceOldest = Math.max(1, Math.ceil((new Date().getTime() - oldestContent.getTime()) / (1000 * 60 * 60 * 24)))
  return totalViews / daysSinceOldest
}

function calculateEngagementRate(content: any[]): number {
  const publishedContent = content.filter(c => c.published)
  if (publishedContent.length === 0) return 0
  const totalViews = calculateTotalViews(publishedContent)
  const totalEngagement = publishedContent.reduce((total, c) => {
    return total + (c.likesCount || 0) + (c.commentsCount || 0)
  }, 0)
  return totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0
}

function getTimeSeriesData(data: any[], dateField: string): any[] {
  const now = new Date()
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()
  const dailyCounts = last30Days.map(date => {
    const count = data.filter(item => {
      const itemDate = new Date(item[dateField]).toISOString().split('T')[0]
      return itemDate === date
    }).length
    return { date, count }
  })
  return dailyCounts
}

function getViewsByDay(content: any[]): any[] {
  const now = new Date()
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()
  return last30Days.map(date => {
    // Sum views for content created on this day
    const views = content
      .filter(item => new Date(item.createdAt).toISOString().split('T')[0] === date)
      .reduce((sum, item) => sum + (item.viewCount || 0), 0)
    return { date, views }
  })
}

function getAvgLovesAndCommentsByDay(content: any[], comments: any[]): any[] {
  const now = new Date()
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()
  return last30Days.map(date => {
    // Likes: sum likes for content created on this day
    const likes = content
      .filter(item => new Date(item.createdAt).toISOString().split('T')[0] === date)
      .reduce((sum, item) => sum + (item.likesCount || 0), 0)
    // Comments: count comments created on this day
    const commentsCount = content
      .filter(item => new Date(item.createdAt).toISOString().split('T')[0] === date)
      .reduce((sum, item) => sum + (item.commentsCount || 0), 0)
    return { date, avg: (likes + commentsCount) / 2, likes, comments: commentsCount }
  })
}

function getContentTypeDistribution(content: any[]): any[] {
  const distribution = content.reduce((acc, item) => {
    const type = item.contentType?.label || 'غير محدد'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  return Object.entries(distribution).map(([type, count]) => ({
    type,
    count
  }))
}
