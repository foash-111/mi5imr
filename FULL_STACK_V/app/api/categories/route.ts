import { type NextRequest, NextResponse } from "next/server"
import { getCategories, createCategory, getDefaultCategories, getCategoriesByContentType, getCategoriesWithCounts } from "@/backend/lib/db"
import { getServerSession } from "next-auth"
import { Category } from "@/backend/models/types"

// GET /api/categories - Get categories (optionally filtered by content type or default)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentTypeId = searchParams.get("contentTypeId")
    const contentTypeIdsParam = searchParams.get("contentTypeIds")
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
      // Return categories with content counts (optionally for multiple content types)
      let ids: string[] | undefined = undefined
      if (contentTypeIdsParam) {
        ids = contentTypeIdsParam.split(",").filter(Boolean)
      } else if (contentTypeId) {
        ids = [contentTypeId]
      }
      categories = await getCategoriesWithCounts(ids)
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
    if (!data.label) {
      return NextResponse.json({ error: "Missing required field: label" }, { status: 400 })
    }

    // Check for duplicate categories
    let existingCategories
    if (data.isDefault) {
      // For default categories, check against all default categories
      existingCategories = await getDefaultCategories()
    } else {
      // For content type categories, check against categories for that content type
      existingCategories = await getCategoriesByContentType(data.contentTypeId)
    }
    
    const duplicateLabel = existingCategories.find(cat => cat.label === data.label)

    if (duplicateLabel) {
      return NextResponse.json({ 
        error: "تصنيف موجود بالفعل", 
        details: `يوجد تصنيف بنفس الاسم "${data.label}"` 
      }, { status: 409 })
    }

    // Prepare category data - only include contentTypeId if it exists
    const categoryData: Omit<Category, "_id"> = {
      label: data.label,
      isDefault: data.isDefault || false,
      createdAt: new Date(),
    }

    // Only add contentTypeId if it's provided (for non-default categories)
    if (data.contentTypeId) {
      categoryData.contentTypeId = data.contentTypeId
    }

    const category = await createCategory(categoryData)
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
