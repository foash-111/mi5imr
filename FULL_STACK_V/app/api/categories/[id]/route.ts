import { type NextRequest, NextResponse } from "next/server"
import { updateCategory, deleteCategory } from "@/backend/lib/db"
import { getServerSession } from "next-auth"

// PUT /api/categories/[id] - Update a category
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params
    const session = await getServerSession()

    // Check if user is authenticated and is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.label) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const success = await updateCategory(awaitedParams.id, {
      label: data.label,
    })

    if (!success) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params
    const session = await getServerSession()

    // Check if user is authenticated and is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const success = await deleteCategory(awaitedParams.id)

    if (!success) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
