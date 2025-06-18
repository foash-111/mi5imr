import { type NextRequest, NextResponse } from "next/server"
import { getCategories, createCategory } from "@/backend/lib/db"
import { getServerSession } from "next-auth"

// GET /api/categories - Get categories (optionally filtered by content type)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentTypeId = searchParams.get("contentTypeId")

    const categories = await getCategories(contentTypeId || undefined)
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    // Check if user is authenticated and is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.label) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const category = await createCategory({
      name: data.name,
      label: data.label,
      contentTypeId: data.contentTypeId,
      isDefault: data.isDefault || false,
      createdAt: new Date(),
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
