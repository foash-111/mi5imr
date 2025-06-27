import { type NextRequest, NextResponse } from "next/server"
import { getCategories, createCategory, getDefaultCategories, getCategoriesByContentType, getCategoriesWithCounts } from "@/backend/lib/db"
import { getServerSession } from "next-auth"

// GET /api/categories - Get categories (optionally filtered by content type or default)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentTypeId = searchParams.get("contentTypeId")
    const defaultOnly = searchParams.get("default")
    const excludeDefault = searchParams.get("excludeDefault")
    const withCounts = searchParams.get("withCounts") === "true"

    let categories
    if (defaultOnly === "true") {
      categories = await getDefaultCategories()
    } else if (excludeDefault === "true" && contentTypeId) {
      // Only return categories specific to the content type, excluding default categories
      categories = await getCategoriesByContentType(contentTypeId)
    } else if (withCounts) {
      // Return categories with content counts
      categories = await getCategoriesWithCounts(contentTypeId || undefined)
    } else {
      categories = await getCategories(contentTypeId || undefined)
    }
    
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

    // Check for duplicate categories - only among non-default categories for this content type
    const existingCategories = await getCategoriesByContentType(data.contentTypeId)
    const duplicateName = existingCategories.find(cat => cat.name === data.name)
    const duplicateLabel = existingCategories.find(cat => cat.label === data.label)

    if (duplicateName) {
      return NextResponse.json({ 
        error: "تصنيف موجود بالفعل", 
        details: `يوجد تصنيف بنفس المعرف "${data.name}"` 
      }, { status: 409 })
    }

    if (duplicateLabel) {
      return NextResponse.json({ 
        error: "تصنيف موجود بالفعل", 
        details: `يوجد تصنيف بنفس الاسم "${data.label}"` 
      }, { status: 409 })
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
