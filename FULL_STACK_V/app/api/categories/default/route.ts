import { NextResponse } from "next/server"
import { getDefaultCategories } from "@/backend/lib/db"

// GET /api/categories/default - Get all default categories
export async function GET() {
  try {
    const categories = await getDefaultCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching default categories:", error)
    return NextResponse.json({ error: "Failed to fetch default categories" }, { status: 500 })
  }
}
