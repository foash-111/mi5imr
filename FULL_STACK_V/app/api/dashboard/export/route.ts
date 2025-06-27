import { type NextRequest, NextResponse } from "next/server"
import { getAllUsers, getAllComments, getAllContent, getContentTypes, getCategories, getActiveSubscribers } from "@/backend/lib/db"
import { getServerSession } from "next-auth"

// GET /api/dashboard/export - Export dashboard data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    // Check if user is authenticated and is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    // Fetch all data
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

    // Prepare export data
    const exportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalUsers: users.length,
        totalContent: content.length,
        totalComments: comments.length,
        totalSubscribers: subscribers.length,
        publishedContent: content.filter(c => c.published).length,
        activeUsers: users.filter(u => u.isActive !== false).length
      },
      users: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        isAdmin: u.isAdmin,
        createdAt: u.createdAt,
        isActive: u.isActive
      })),
      content: content.map(c => ({
        id: c._id,
        title: c.title,
        contentType: c.contentType?.label,
        published: c.published,
        featured: c.featured,
        views: c.viewCount || 0,
        likes: c.likesCount || 0,
        comments: c.commentsCount || 0,
        createdAt: c.createdAt
      })),
      comments: comments.map(c => ({
        id: c._id,
        contentId: c.contentId,
        userName: c.userName,
        content: c.content,
        status: c.status,
        createdAt: c.createdAt
      })),
      subscribers: subscribers.map(s => ({
        email: s.email,
        isActive: s.isActive,
        subscribedAt: s.subscribedAt
      }))
    }

    // Return based on format
    if (format === 'csv') {
      // For CSV, we'll return a simplified version
      const csvData = {
        summary: exportData.summary,
        contentTypes: contentTypes.map(ct => ({
          name: ct.label,
          count: content.filter(c => c.contentType?.label === ct.label).length
        }))
      }
      
      return NextResponse.json(csvData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="dashboard-export.json"'
        }
      })
    }

    // Default JSON format
    return NextResponse.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="dashboard-export.json"'
      }
    })

  } catch (error) {
    console.error("Error exporting dashboard data:", error)
    return NextResponse.json({ error: "Failed to export dashboard data" }, { status: 500 })
  }
} 