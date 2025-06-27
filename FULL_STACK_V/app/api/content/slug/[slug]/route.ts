import { type NextRequest, NextResponse } from "next/server"
import { getContentBySlug, incrementContentViews } from "@/backend/lib/db"

// GET /api/content/slug/[slug] - Get content by slug
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
		const awaitedParams = await params;
    console.log("🔍 Looking for content with slug:", awaitedParams.slug);
    
    const content = await getContentBySlug(awaitedParams.slug)

    if (!content) {
      console.log("❌ Content not found for slug:", awaitedParams.slug);
      return NextResponse.json({ 
        error: "Content not found",
        slug: awaitedParams.slug,
        message: "No content found with this slug"
      }, { status: 404 })
    }

    console.log("✅ Content found:", {
      id: content._id,
      title: content.title,
      slug: content.slug
    });

    // Increment view count
    if (content._id) {
      await incrementContentViews(content._id.toString())
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error("❌ Error fetching content by slug:", error)
    return NextResponse.json({ 
      error: "Failed to fetch content",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
