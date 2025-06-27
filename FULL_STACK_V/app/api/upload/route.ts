import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { uploadToFalStorage } from "@/lib/upload-utils"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 POST /api/upload - Starting file upload")

    // Check authentication
    const session = await getServerSession()
    if (!session?.user?.email) {
      console.log("❌ Unauthorized upload attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("✅ User authenticated for upload:", session.user.email)

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("❌ No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("📁 File received:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Upload to fal.ai
    const url = await uploadToFalStorage(file)

    console.log("✅ File uploaded successfully:", url)

    return NextResponse.json({
      success: true,
      url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("❌ Upload error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
