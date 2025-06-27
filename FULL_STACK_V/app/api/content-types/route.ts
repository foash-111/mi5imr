import { type NextRequest, NextResponse } from "next/server"
import { getContentTypes, createContentType } from "@/backend/lib/db"
import { getServerSession } from "next-auth"
import { ensureInitialCache } from "@/backend/lib/cacheInit";
import redis from "@/backend/lib/redis";


// GET /api/content-types - Get all content types
export async function GET() {
  try {
	/* 	await ensureInitialCache();
	   const contentTypes = await redis.get("contentTypes"); */
    const contentTypes = await getContentTypes()
		//console.log("Fetched content types:", contentTypes)
    return NextResponse.json(contentTypes)
  } catch (error) {
    console.error("Error fetching content types:", error)
    return NextResponse.json({ error: "Failed to fetch content types" }, { status: 500 })
  }
}

// POST /api/content-types - Create a new content type
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    // Check if user is authenticated and is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.label || !data.icon) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const contentType = await createContentType({
      name: data.name,
      label: data.label,
      icon: data.icon,
      createdAt: new Date(),
    })

    return NextResponse.json(contentType, { status: 201 })
  } catch (error) {
    console.error("Error creating content type:", error)
    return NextResponse.json({ error: "Failed to create content type" }, { status: 500 })
  }
}
