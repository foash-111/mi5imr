import { type NextRequest, NextResponse } from "next/server"
import { getAllUsers, getUserByEmail, getAllComments, getAllContent, getContentTypes, getCategories, getActiveSubscribers } from "@/backend/lib/db"
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
      contentData,
      contentTypes,
      categories,
      subscribers
    ] = await Promise.all([
      getAllUsers(),
      getAllComments(),
      getAllContent({ published: true }),
      getContentTypes(),
      getCategories(),
      getActiveSubscribers()
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
        total: content.length,
        published: content.filter(c => c.published).length,
        drafts: content.filter(c => !c.published).length,
        featured: content.filter(c => c.featured).length,
        byType: contentTypes.map(type => ({
          name: type.label,
          count: content.filter(c => c.contentType?.label === type.label).length,
          published: content.filter(c => c.contentType?.label === type.label && c.published).length
        })),
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
      const aScore = (a.views || 0) + (a.likes || 0) * 2 + (a.comments || 0) * 3
      const bScore = (b.views || 0) + (b.likes || 0) * 2 + (b.comments || 0) * 3
      return bScore - aScore
    })
    .slice(0, 10)
    .map(c => ({
      id: c._id,
      title: c.title,
      views: c.views || 0,
      likes: c.likes || 0,
      comments: c.comments || 0,
      score: (c.views || 0) + (c.likes || 0) * 2 + (c.comments || 0) * 3
    }))
}

function getTopEngagedContent(content: any[]): any[] {
  return content
    .filter(c => c.published)
    .map(c => ({
      id: c._id,
      title: c.title,
      engagementRate: calculateContentEngagementRate(c),
      views: c.views || 0,
      likes: c.likes || 0,
      comments: c.comments || 0
    }))
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 10)
}

function calculateTotalLikes(content: any[]): number {
  return content.reduce((total, c) => total + (c.likes || 0), 0)
}

function calculateTotalViews(content: any[]): number {
  return content.reduce((total, c) => total + (c.views || 0), 0)
}

function calculateAverageEngagement(content: any[]): number {
  const publishedContent = content.filter(c => c.published)
  if (publishedContent.length === 0) return 0
  
  const totalEngagement = publishedContent.reduce((total, c) => {
    return total + (c.likes || 0) + (c.comments || 0)
  }, 0)
  
  return totalEngagement / publishedContent.length
}

function calculateContentEngagementRate(content: any): number {
  const views = content.views || 0
  if (views === 0) return 0
  
  const engagement = (content.likes || 0) + (content.comments || 0)
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
    return total + (c.likes || 0) + (c.comments || 0)
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
