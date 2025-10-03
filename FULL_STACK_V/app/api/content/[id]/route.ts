import { type NextRequest, NextResponse } from "next/server"
import { getContentById, updateContent, deleteContent, getUserByEmail, getCategories } from "@/backend/lib/db"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import fs from "fs/promises"
import path from "path"
import { uploadToFalStorage } from "@/lib/upload-utils"


// GET /api/content/[id] - Get content by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const contentTypeId = formData.get("contentTypeId") as string;
    const categoryIds = formData.get("categoryIds") ? JSON.parse(formData.get("categoryIds") as string) : [];
    const tags = formData.get("tags") ? JSON.parse(formData.get("tags") as string) : [];
    const externalUrl = formData.get("externalUrl") as string;
    const published = formData.get("published") === "true";
    const featured = formData.get("featured") === "true";
    const coverImageFile = formData.get("coverImage") as File | null;
    const existingCoverImage = formData.get("existingCoverImage") as string | null;

    // Validate required formData
    if (!title || !content || !contentTypeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate new slug from title
    let slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

    // Handle edge cases where slug might be empty or just dashes
    if (!slug || slug === "-") {
      // Generate a fallback slug using timestamp
      const timestamp = Date.now()
      slug = `post-${timestamp}`
    }

    console.log("🔗 Generated slug for edit:", slug)

    // Handle photo upload
    let coverImage: string | undefined

    if (coverImageFile) {
      // Upload to Fal.ai storage instead of saving locally
      coverImage = await uploadToFalStorage(coverImageFile)
    } else if (existingCoverImage) {
      coverImage = existingCoverImage; // Use existing image URL
    } else {
      // Fetch existing coverImage from database
      const existingContent = await getContentById(awaitedParams.id);
      coverImage = existingContent?.coverImage;
    }

    // Resolve full category objects to keep label/isDefault for counts and filtering
    const allCats = await getCategories()
    const categoriesResolved = categoryIds
      .map((id: string) => allCats.find((c) => c._id?.toString() === id))
      .filter(Boolean)
      .map((category: any) => ({
        _id: new ObjectId(category._id),
        name: category.name,
        label: category.label,
        isDefault: !!category.isDefault,
      }))

    // Update content
    const success = await updateContent(awaitedParams.id, {
      title,
      slug,
      content,
      excerpt,
      // Fetch the full contentType object (assuming you have a function getContentTypeById)
      contentType: await (async () => {
        const { getContentTypeById } = await import("@/backend/lib/db");
        const contentType = await getContentTypeById(contentTypeId);
        if (!contentType) {
          throw new Error("Invalid contentTypeId");
        }
        return {
          _id: new ObjectId(contentTypeId),
          label: contentType.label,
          icon: contentType.icon,
        };
      })(),
      categories: categoriesResolved,
      tags,
      externalUrl: externalUrl || undefined,
      published: published,
      featured: featured,
      coverImage,
      updatedAt: new Date(),
    })

    if (!success) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    // Get the updated content to return the slug
    const updatedContent = await getContentById(awaitedParams.id)
    
    console.log("✅ Content updated successfully:", {
      id: updatedContent?._id,
      slug: updatedContent?.slug,
      title: updatedContent?.title,
    })

    return NextResponse.json({
      success: true,
      id: updatedContent?._id,
      slug: updatedContent?.slug,
      title: updatedContent?.title,
      message: "Content updated successfully",
    })
  } catch (error) {
    console.error("Error updating content:", error)
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 })
  }
}

// DELETE /api/content/[id] - Delete content
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
