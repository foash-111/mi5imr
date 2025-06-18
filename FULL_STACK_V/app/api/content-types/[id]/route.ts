import { type NextRequest, NextResponse } from "next/server"
import { updateContentType, deleteContentType } from "@/backend/lib/db"
import { getServerSession } from "next-auth"


// PUT /api/content-types/[id] - Update a content type
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
		
		const awaitedParams = await params;
		console.log("Updating content type with ID:", awaitedParams.id)
    const session = await getServerSession()

    // Check if user is authenticated and is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.label || !data.icon) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const success = await updateContentType(awaitedParams.id, {
      label: data.label,
      icon: data.icon,
    })

    if (!success) {
      return NextResponse.json({ error: "Content type not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating content type:", error)
    return NextResponse.json({ error: "Failed to update content type" }, { status: 500 })
  }
}

// DELETE /api/content-types/[id] - Delete a content type
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {

	  const awaitedParams = await params;
    const session = await getServerSession()

    // Check if user is authenticated and is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

		console.log("Deleting content type with ID:", awaitedParams.id)

    const success = await deleteContentType(awaitedParams.id)

    if (!success) {
      return NextResponse.json({ error: "Content type not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting content type:", error)
    return NextResponse.json({ error: "Failed to delete content type" }, { status: 500 })
  }
}
