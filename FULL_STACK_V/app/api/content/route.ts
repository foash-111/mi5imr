import { type NextRequest, NextResponse } from "next/server"
import { getAllContent, createContent, getUserByEmail } from "@/backend/lib/db"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import fs from "fs/promises"
import path from "path"
// import { console } from "inspector"
import type { Content } from "@/backend/models/types"

// GET /api/content - Get all content with filters
export async function GET(request: NextRequest) {
  try {

    const searchParams = request.nextUrl.searchParams

		const contentType = searchParams.getAll("contentType").length > 0
      ? searchParams.getAll("contentType")
      : undefined;

    const options = {
      published: searchParams.get("published") !== "false",
      contentType,
      category: searchParams.get("category") || undefined,
      tag: searchParams.get("tag") || undefined,
      featured: searchParams.has("featured") ? searchParams.get("featured") === "true" : undefined,
      sortBy: (searchParams.get("sortBy") as "newest" | "popular" | "trending") || "newest",
      limit: Number.parseInt(searchParams.get("limit") || "10"),
      skip: Number.parseInt(searchParams.get("skip") || "0"),
			createdAt: searchParams.get("createdAt") ? JSON.parse(searchParams.get("createdAt") as string) : undefined,
      search: searchParams.get("q") || undefined,
    }

    const content = await getAllContent(options)
		// console.log("rotes api/content", content)
    return NextResponse.json(content)
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}

// api/create content

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for multipart/form-data
  },
}

const uploadDir = path.join(process.cwd(), "public/uploads")

export async function POST(request: NextRequest) {
	console.log("API /api/content/:")
  try {
    const session = await getServerSession()
    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email)

    if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Forbiddenn" }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
		 console.log("formData soi", formData)
		// Check if formData is empty

    // Validate required fields
    const title = formData.get("title") as string
    const slug = formData.get("slug") as string
    const content = formData.get("content") as string
    const contentType = formData.get("contentType") ? JSON.parse(formData.get("contentType") as string) : null
    const categories = formData.get("categories") ? JSON.parse(formData.get("categories") as string) : []
    const tags = formData.get("tags") ? JSON.parse(formData.get("tags") as string) : []
    const author = formData.get("author") ? JSON.parse(formData.get("author") as string) : null


		// data validation
    if (!title  || !slug || !content || !contentType || !author) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    /* // Validate ObjectIds
    if (!ObjectId.isValid(contentType._id) || !ObjectId.isValid(author._id)) {
      return NextResponse.json({ error: "Invalid contentType or author ID" }, { status: 400 })
    } */
    for (const category of categories) {
      if (!ObjectId.isValid(category._id)) {
        return NextResponse.json({ error: "Invalid category ID" }, { status: 400 })
      }
      category._id = new ObjectId(category._id)
    }

    // Handle file upload
    let coverImage: string | undefined
    const coverImageFile = formData.get("coverImage") as File | null;

		
    if (coverImageFile) {
      const fileName = `${Date.now()}-${coverImageFile.name}`
      const filePath = path.join(uploadDir, fileName)
      const fileBuffer = Buffer.from(await coverImageFile.arrayBuffer())
      await fs.writeFile(filePath, fileBuffer)
      coverImage = `/uploads/${fileName}`
    }

    // Prepare content data
    const contentData: Content = {
      title,
      slug,
      content,
			//excerpt || "" ,
      coverImage,
      author: {
        _id: new ObjectId(author._id),
        name: author.name,
        avatar: author.avatar,
      },
      contentType: {
        _id: new ObjectId(contentType._id),
        name: contentType.name || "",
        label: contentType.label,
        icon: contentType.icon,
      },
      categories: categories.map((cat: any) => ({
        _id: cat._id,
        name: cat.name,
        label: cat.label,
      })),
      tags,
      externalUrl: formData.get("externalUrl") as string | undefined,
      published: formData.get("published") === "true",
      featured: formData.get("featured") === "true",
      viewCount: parseInt(formData.get("viewCount") as string || "0"),
      likesCount: parseInt(formData.get("likesCount") as string || "0"),
      commentsCount: parseInt(formData.get("commentsCount") as string || "0"),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Save to database
    const newContent = await createContent(contentData)

    return NextResponse.json(newContent, { status: 201 })
  } catch (error: any) {
    console.error("Error creating content:", error)
    return NextResponse.json({ error: error.message || "Failed to create content" }, { status: 500 })
  }
}
// 
