import { type NextRequest, NextResponse } from "next/server"
import { incrementContentViews } from "@/backend/lib/db"

// POST /api/content/[id]/view - Increment content views
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const awaitedParams = await params;
    const contentId = awaitedParams.id;
    
    console.log("📊 Incrementing views for content:", contentId);
    
    const success = await incrementContentViews(contentId);
    
    if (!success) {
      return NextResponse.json({ 
        error: "Failed to increment views",
        contentId: contentId
      }, { status: 400 });
    }
    
    console.log("✅ Views incremented successfully for content:", contentId);
    
    return NextResponse.json({ 
      success: true,
      contentId: contentId,
      message: "Views incremented successfully"
    });
    
  } catch (error) {
    console.error("❌ Error incrementing content views:", error);
    return NextResponse.json({ 
      error: "Failed to increment content views",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

