import { type NextRequest, NextResponse } from "next/server"
import { getContentById, updateContent, deleteContent, getUserByEmail } from "@/backend/lib/db"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import fs from "fs/promises"
import path from "path"


// GET /api/content/[id] - Get content by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {

		const awaitedParams = await params;
    const content = await getContentById(awaitedParams.id)

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable Next.js default body parser
  },
};
const uploadDir = path.join(process.cwd(), "public/uploads")
// PUT /api/content/[id] - Update content
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {

		const awaitedParams = await params;
    const session = await getServerSession()

    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email)

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
		 console.log("formData soi", formData)
		// Check if formData is empty

		// Validate required fields
    // Extract fields
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const contentTypeId = formData.get("contentTypeId") as string;
    const categories = formData.get("categories") ? JSON.parse(formData.get("categories") as string) : [];
    const tags = formData.get("tags") ? JSON.parse(formData.get("tags") as string) : [];
    const externalUrl = formData.get("externalUrl") as string;
    const published = formData.get("published") === "true";
    const featured = formData.get("featured") === "true";
    //const author = formData.get("author") ? JSON.parse(formData.get("author") as string) : null;
    const coverImageFile = formData.get("coverImage") as File | null;
    const coverImageUrl = formData.get("coverImageUrl") as string | null;


	 // Validate required formData
    if (!title || !content || !contentTypeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

		//Handle photo upload
		let coverImage: string | undefined
    /* const coverImageFile = formData.get("coverImage") as File | null; */

		
    if (coverImageFile) {
      const fileName = `${Date.now()}-${coverImageFile.name}`
      const filePath = path.join(uploadDir, fileName)
      const fileBuffer = Buffer.from(await coverImageFile.arrayBuffer())
      await fs.writeFile(filePath, fileBuffer)
      coverImage = `/uploads/${fileName}`
    } else if (coverImageUrl) {
      coverImage = coverImageUrl; // Use existing image URL
    } else {
      // Fetch existing coverImage from database
      const existingContent = await getContentById(awaitedParams.id);
      coverImage = existingContent?.coverImage;
    }

    // Update content
    const success = await updateContent(awaitedParams.id, {
      title,
      content,
      excerpt,
			slug,
      contentType: {
        _id: new ObjectId(contentTypeId),
      },
      categories: categories.map((id: string) => ({ _id: new ObjectId(id) })),
      tags,
      externalUrl: formData.get("externalUrl") as string | undefined,
      published: formData.get("published") === "true",
      featured: formData.get("featured") === "true",
      coverImage,
      updatedAt: new Date(),
    })

    if (!success) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating content:", error)
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 })
  }
}

// DELETE /api/content/[id] - Delete content
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
		
		const awaitedParams = await params;
    const session = await getServerSession()

    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email)

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete content
    const success = await deleteContent(awaitedParams.id)

    if (!success) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting content:", error)
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 })
  }
}
