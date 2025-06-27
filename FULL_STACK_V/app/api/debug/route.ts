import { type NextRequest, NextResponse } from "next/server"
import { getAllContent, getDb } from "@/backend/lib/db"

// GET /api/debug - Debug endpoint to list all content and check database schema
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debug: Fetching all content from database")
    
    const db = await getDb()
    
    // Get all content
    const content = await getAllContent({ published: undefined }) // Get all content regardless of published status

    console.log("✅ Debug: Found content items:", content.length)

    // Check database schema by looking at existing documents
    const sampleContent = content.length > 0 ? content[0] : null
    
    // Get collection info
    const collectionStats = await db.collection("content").stats()
    
    // Check for indexes
    const indexes = await db.collection("content").indexes()

    // Return comprehensive debug information
    const debugInfo = {
      contentCount: content.length,
      sampleContent: sampleContent ? {
        id: sampleContent._id,
        title: sampleContent.title,
        slug: sampleContent.slug,
        hasSlug: 'slug' in sampleContent,
        slugType: typeof sampleContent.slug,
        allFields: Object.keys(sampleContent),
        published: sampleContent.published,
        createdAt: sampleContent.createdAt,
        updatedAt: sampleContent.updatedAt
      } : null,
      contentList: content.map(item => ({
        id: item._id,
        title: item.title,
        slug: item.slug,
        hasSlug: 'slug' in item,
        slugType: typeof item.slug,
        published: item.published,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })),
      databaseInfo: {
        collectionName: "content",
        documentCount: collectionStats.count,
        size: collectionStats.size,
        avgObjSize: collectionStats.avgObjSize,
        indexes: indexes.map(idx => ({
          name: idx.name,
          key: idx.key,
          unique: idx.unique
        }))
      }
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error("❌ Debug error:", error)
    return NextResponse.json({ 
      error: "Debug failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}
