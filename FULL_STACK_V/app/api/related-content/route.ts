import { type NextRequest, NextResponse } from "next/server"
import { getRelatedContent } from "@/backend/lib/db"

// GET /api/related-content?contentId=123&limit=6 - Get related content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get("contentId")
    const limit = parseInt(searchParams.get("limit") || "6")

    if (!contentId) {
      return NextResponse.json({ error: "Content ID is required" }, { status: 400 })
    }

    const relatedContent = await getRelatedContent(contentId, limit)
    return NextResponse.json(relatedContent)
  } catch (error) {
    console.error("Error fetching related content:", error)
    return NextResponse.json({ error: "Failed to fetch related content" }, { status: 500 })
  }
} 