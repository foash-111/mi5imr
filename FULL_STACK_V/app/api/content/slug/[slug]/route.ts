import { type NextRequest, NextResponse } from "next/server"
import { getContentBySlug, incrementContentViews } from "@/backend/lib/db"

// GET /api/content/slug/[slug] - Get content by slug
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
		const awaitedParams = await params;
    const content = await getContentBySlug(awaitedParams.slug)

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    // Increment view count
    if (content._id) {
      await incrementContentViews(content._id.toString())
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}
