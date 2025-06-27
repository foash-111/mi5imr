import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/backend/lib/db"
import { ObjectId } from "mongodb"

// POST /api/debug/fix-content - Fix existing content documents missing slug field
export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Debug: Starting content fix process")
    
    const db = await getDb()
    
    // Find all content documents that don't have a slug field
    const contentWithoutSlug = await db.collection("content").find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: "" },
        { slug: "undefined" }
      ]
    }).toArray()

    console.log(`🔧 Found ${contentWithoutSlug.length} content documents without proper slug`)

    const fixedContent = []

    for (const content of contentWithoutSlug) {
      // Generate slug from title
      let slug = content.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()

      // Handle edge cases
      if (!slug || slug === "-") {
        const timestamp = Date.now()
        slug = `post-${timestamp}`
      }

      // Ensure slug is unique by adding suffix if needed
      let finalSlug = slug
      let counter = 1
      while (await db.collection("content").findOne({ slug: finalSlug, _id: { $ne: content._id } })) {
        finalSlug = `${slug}-${counter}`
        counter++
      }

      // Update the document
      await db.collection("content").updateOne(
        { _id: content._id },
        { 
          $set: { 
            slug: finalSlug,
            updatedAt: new Date()
          } 
        }
      )

      fixedContent.push({
        id: content._id,
        title: content.title,
        oldSlug: content.slug || "missing",
        newSlug: finalSlug
      })

      console.log(`✅ Fixed content: "${content.title}" -> slug: "${finalSlug}"`)
    }

    return NextResponse.json({
      success: true,
      fixedCount: fixedContent.length,
      fixedContent
    })
  } catch (error) {
    console.error("❌ Content fix error:", error)
    return NextResponse.json({ 
      error: "Content fix failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
} 