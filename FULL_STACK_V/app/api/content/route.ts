import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createContent, getAllContent, getUserByEmail, getContentTypeById, getCategories, sendNewsletterForNewContent, getAllUsers, createNotification } from "@/backend/lib/db"
import { fal } from "@fal-ai/client"
import type { Content } from "@/backend/models/types"

if (typeof window !== "undefined") {
  fal.config({ credentials: process.env.NEXT_PUBLIC_FAL_KEY })
}

async function uploadToFalStorage(file: File): Promise<string> {
  if (!process.env.FAL_KEY) throw new Error("FAL_KEY not configured")
  const url = await fal.storage.upload(file)
  return url
}

async function fileFromDataUrl(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type })
}


export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/content - Starting content fetch")

    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get("sortBy") || "newest"
    const contentType = searchParams.get("contentType")
    const contentTypes = searchParams.get("contentTypes")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const timeFilter = searchParams.get("timeFilter")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Check if user is authenticated
    const session = await getServerSession();
    // Get user from database
    const user = session?.user?.email ? await getUserByEmail(session.user.email) : null;
    const userId = user?._id!.toString();

    const contentTypeArray = searchParams.getAll("contentType").length > 0
      ? searchParams.getAll("contentType")
      : undefined;

    const options = {
      published: searchParams.get("published") !== "false",
      contentType: contentTypeArray,
      category: searchParams.get("category") || undefined,
      tag: searchParams.get("tag") || undefined,
      featured: searchParams.has("featured") ? searchParams.get("featured") === "true" : undefined,
      sortBy: (searchParams.get("sortBy") as "newest" | "popular" | "trending") || "newest",
      limit: Number.parseInt(searchParams.get("limit") || "10"),
      skip: Number.parseInt(searchParams.get("skip") || "0"),
      createdAt: searchParams.get("createdAt") ? JSON.parse(searchParams.get("createdAt") as string) : undefined,
      search: searchParams.get("q") || undefined,
      userId,
    }

    // Fetch content and total count
    const { content, totalCount } = await getAllContent(options);

    // Return both content and totalCount
    return NextResponse.json({ content, totalCount });
  } catch (error) {
    console.error("❌ Error fetching content:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 POST /api/content - Starting content creation")

    // Check authentication with proper authOptions
    const session = await getServerSession()
    if (!session?.user?.email) {
      console.log("❌ Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("✅ User authenticated:", session.user.email)

    // Get request content type
    const requestContentType = request.headers.get("content-type") || ""
    let postData: any
    let uploadedCoverImageUrl: string | null = null

    // Always use FormData for Tiptap content to handle rich text properly
    if (requestContentType.includes("multipart/form-data")) {
      console.log("📁 Processing multipart form data with rich text content")

      const formData = await request.formData()

      // Extract and parse form fields with special handling for rich text
      postData = {
        title: formData.get("title") as string,
        content: formData.get("content") as string, // Tiptap HTML content
        excerpt: formData.get("excerpt") as string,
        contentTypeId: formData.get("contentTypeId") as string,
        externalUrl: formData.get("externalUrl") as string,
        published: formData.get("published") === "true",
        featured: formData.get("featured") === "true",
      }

      // Parse JSON fields safely
      try {
        const categoryIdsStr = formData.get("categoryIds") as string
        postData.categoryIds = categoryIdsStr ? JSON.parse(categoryIdsStr) : []
      } catch (error) {
        console.warn("⚠️ Failed to parse categoryIds, using empty array")
        postData.categoryIds = []
      }

      try {
        const tagsStr = formData.get("tags") as string
        postData.tags = tagsStr ? JSON.parse(tagsStr) : []
      } catch (error) {
        console.warn("⚠️ Failed to parse tags, using empty array")
        postData.tags = []
      }

      console.log("📝 Rich text content length:", postData.content?.length || 0)

      // Handle cover image upload
      const coverImageFile = formData.get("coverImage") as File
      if (coverImageFile && coverImageFile.size > 0) {
        console.log("🖼️ Uploading cover image to fal.ai:", {
          name: coverImageFile.name,
          size: coverImageFile.size,
          type: coverImageFile.type,
        })

        try {
          uploadedCoverImageUrl = await uploadToFalStorage(coverImageFile)
          console.log("✅ Cover image uploaded successfully:", uploadedCoverImageUrl)
        } catch (uploadError) {
          console.error("❌ Failed to upload cover image:", uploadError)
          return NextResponse.json(
            {
              error: "Failed to upload cover image",
              details: uploadError instanceof Error ? uploadError.message : "Unknown upload error",
            },
            { status: 500 },
          )
        }
      }

      // Use uploaded URL or existing URL
      postData.coverImage = uploadedCoverImageUrl || (formData.get("existingCoverImage") as string) || ""

      // Handle any embedded images in Tiptap content
      if (postData.content) {
        console.log("🔍 Checking for embedded images in rich text content...")
        postData.content = await processEmbeddedImages(postData.content)
      }
    } else {
      console.log("❌ Only multipart/form-data is supported for rich text content")
      return NextResponse.json(
        {
          error: "Content type not supported",
          message: "Rich text content requires multipart/form-data",
          supportedTypes: ["multipart/form-data"],
        },
        { status: 400 },
      )
    }

    console.log("📊 Post data prepared:", {
      title: postData.title,
      titleLength: postData.title?.length || 0,
      contentLength: postData.content?.length || 0,
      excerpt: postData.excerpt?.substring(0, 50) + "...",
      contentTypeId: postData.contentTypeId,
      categoryCount: postData.categoryIds?.length || 0,
      tagCount: postData.tags?.length || 0,
      hasCoverImage: !!postData.coverImage,
      published: postData.published,
      featured: postData.featured,
    })

    // Validate required fields
    const validationErrors: string[] = []

    if (!postData.title?.trim()) {
      validationErrors.push("Title is required")
    }

    if (!postData.content?.trim()) {
      validationErrors.push("Content is required")
    }

    if (!postData.contentTypeId?.trim()) {
      validationErrors.push("Content type is required")
    }

    // Validate rich text content isn't just empty HTML
    if (postData.content && isEmptyRichText(postData.content)) {
      validationErrors.push("Content cannot be empty")
    }

    if (validationErrors.length > 0) {
      console.log("❌ Validation failed:", validationErrors)
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErrors.join(", "),
          receivedData: {
            hasTitle: !!postData.title,
            hasContent: !!postData.content,
            hasContentTypeId: !!postData.contentTypeId,
            contentPreview: postData.content?.substring(0, 100) + "...",
          },
        },
        { status: 400 },
      )
    }

    // Ensure arrays are properly formatted
    postData.categoryIds = Array.isArray(postData.categoryIds) ? postData.categoryIds : []
    postData.tags = Array.isArray(postData.tags) ? postData.tags : []

    // Get user from database
    const user = await getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get content type from database
    const contentType = await getContentTypeById(postData.contentTypeId)
    if (!contentType) {
      return NextResponse.json({ error: "Content type not found" }, { status: 404 })
    }

    // Get categories from database
    const allCategories = await getCategories()
    const categories = allCategories
      .filter(category => postData.categoryIds.includes(category._id!.toString()))
      .map(category => ({
        _id: category._id!,
        name: category.name,
        label: category.label,
        isDefault: category.isDefault,
      }))

    // Generate slug from title
    let slug = postData.title
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

    // Ensure slug is unique by adding a suffix if needed
    // For now, we'll just use the timestamp approach above
    console.log("🔗 Generated slug:", slug)

    // Create content in database
    console.log("💾 Creating content in database...")
    const contentData: Content = {
      title: postData.title,
      slug,
      content: postData.content,
      excerpt: postData.excerpt || "",
      coverImage: postData.coverImage || "",
      author: {
        _id: user._id!,
        name: user.name,
        avatar: user.avatar,
      },
      contentType: {
        _id: contentType._id!,
        name: contentType.name,
        label: contentType.label,
        icon: contentType.icon,
      },
      categories,
      tags: postData.tags,
      externalUrl: postData.externalUrl || "",
      published: postData.published,
      featured: postData.featured,
      viewCount: 0,
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("📝 Content data before database insertion:", {
      title: contentData.title,
      slug: contentData.slug,
      slugType: typeof contentData.slug,
      hasSlug: 'slug' in contentData,
    })

    const result = await createContent(contentData)

    // Send newsletter to subscribers
    try {
      await sendNewsletterForNewContent(result)
    } catch (e) {
      console.error("Failed to send newsletter for new content:", e)
    }

    // Notify all users about the new post
    try {
      const users = await getAllUsers()
      await Promise.all(users.map(user =>
        createNotification({
          userId: user._id,
          type: 'new_post',
          contentId: result._id,
          title: result.title,
          message: `تم نشر مقال جديد: ${result.title}`,
          isRead: false,
          createdAt: new Date(),
        })
      ))
    } catch (e) {
      console.error("Failed to notify users about new post:", e)
    }

    console.log("✅ Content created successfully:", {
      id: result._id,
      slug: result.slug,
      title: result.title,
      fullResult: JSON.stringify(result, null, 2)
    })

    // Ensure we're returning the slug explicitly
    const responseData = {
      success: true,
      id: result._id,
      slug: result.slug,
      title: result.title,
      message: "Content created successfully",
    }

    console.log("📤 Sending response:", responseData)
    console.log("📤 Response slug type:", typeof responseData.slug, "Value:", responseData.slug)
    console.log("📤 Full response JSON:", JSON.stringify(responseData, null, 2))

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("❌ Error creating content:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Failed to create content",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Helper function to check if rich text content is effectively empty
function isEmptyRichText(content: string): boolean {
  if (!content) return true

  // Remove HTML tags and check if there's actual content
  const textContent = content.replace(/<[^>]*>/g, "").trim()

  // Check for common empty states
  const emptyPatterns = [
    "", // completely empty
    "<p></p>", // empty paragraph
    "<p><br></p>", // paragraph with just line break
    "<div></div>", // empty div
    "<p>&nbsp;</p>", // paragraph with non-breaking space
  ]

  return emptyPatterns.includes(content.trim()) || textContent.length === 0
}

// Helper function to process embedded images in Tiptap content
async function processEmbeddedImages(content: string): Promise<string> {
  try {
    // Find all base64 images in the content
    const base64ImageRegex = /<img[^>]+src="data:image\/[^;]+;base64,[^"]*"/g
    const matches = content.match(base64ImageRegex)

    if (!matches || matches.length === 0) {
      console.log("📝 No embedded images found in content")
      return content
    }

    console.log(`🖼️ Found ${matches.length} embedded images, uploading to fal.ai...`)

    let processedContent = content

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i]
      const srcMatch = match.match(/src="(data:image\/[^;]+;base64,[^"]*)"/)

      if (srcMatch) {
        const base64Data = srcMatch[1]
        const filename = `embedded-image-${Date.now()}-${i}.png`

        try {
          // Convert base64 to file and upload
          const response = await fetch(base64Data)
          const blob = await response.blob()
          const file = new File([blob], filename, { type: "image/png" })

          const uploadedUrl = await uploadToFalStorage(file)

          // Replace the base64 src with the uploaded URL
          processedContent = processedContent.replace(base64Data, uploadedUrl)

          console.log(`✅ Embedded image ${i + 1} uploaded:`, uploadedUrl)
        } catch (uploadError) {
          console.error(`❌ Failed to upload embedded image ${i + 1}:`, uploadError)
          // Continue with other images even if one fails
        }
      }
    }

    return processedContent
  } catch (error) {
    console.error("❌ Error processing embedded images:", error)
    return content // Return original content if processing fails
  }
}