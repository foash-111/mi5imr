import { fal } from "@fal-ai/client"

// Server-side configuration - use FAL_KEY (not NEXT_PUBLIC_FAL_KEY)
export async function uploadToFalStorage(file: File): Promise<string> {
  try {
    console.log("🔍 Starting fal.ai upload (server-side):", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Use server-side FAL_KEY
    const falKey = process.env.FAL_KEY
    if (!falKey) {
      throw new Error("FAL_KEY not configured in environment variables")
    }

    // Configure fal client with server-side key
    fal.config({ credentials: falKey })

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`)
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "audio/mpeg",
      "audio/wav",
      "video/mp4",
      "video/webm",
    ]

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not supported. Allowed types: ${allowedTypes.join(", ")}`)
    }

    console.log("✅ File validation passed")

    // Upload to fal.ai storage
    const url = await fal.storage.upload(file)

    console.log("✅ File uploaded to fal.ai successfully:", url)
    return url
  } catch (error) {
    console.error("❌ fal.ai upload failed:", error)
    throw error
  }
}

// Client-side configuration for browser usage
export async function uploadToFalStorageClient(file: File): Promise<string> {
  try {
    console.log("🔍 Starting fal.ai upload (client-side):", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Use client-side NEXT_PUBLIC_FAL_KEY
    const falKey = process.env.NEXT_PUBLIC_FAL_KEY
    if (!falKey) {
      throw new Error("NEXT_PUBLIC_FAL_KEY not configured")
    }

    // Configure fal client with client-side key
    fal.config({ credentials: falKey })

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`)
    }

    // Upload to fal.ai storage
    const url = await fal.storage.upload(file)

    console.log("✅ File uploaded to fal.ai successfully (client):", url)
    return url
  } catch (error) {
    console.error("❌ fal.ai client upload failed:", error)
    throw error
  }
}

export async function fileFromDataUrl(dataUrl: string, filename: string): Promise<File> {
  try {
    console.log("🔍 Converting data URL to file:", { filename })

    const res = await fetch(dataUrl)
    const blob = await res.blob()
    const file = new File([blob], filename, { type: blob.type })

    console.log("✅ Data URL converted to file:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    return file
  } catch (error) {
    console.error("❌ Failed to convert data URL to file:", error)
    throw error
  }
}

export async function uploadBase64ToFal(base64Data: string, filename: string): Promise<string> {
  try {
    console.log("🔍 Uploading base64 data to fal.ai:", { filename })

    const file = await fileFromDataUrl(base64Data, filename)
    const url = await uploadToFalStorage(file)

    console.log("✅ Base64 data uploaded to fal.ai:", url)
    return url
  } catch (error) {
    console.error("❌ Failed to upload base64 to fal.ai:", error)
    throw error
  }
}

// Utility to get file info from fal.ai URL
export function getFalFileInfo(url: string) {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")
    const filename = pathParts[pathParts.length - 1]

    return {
      filename,
      isImage: /\.(jpg|jpeg|png|gif|webp)$/i.test(filename),
      isVideo: /\.(mp4|webm|mov)$/i.test(filename),
      isAudio: /\.(mp3|wav|ogg)$/i.test(filename),
      isPdf: /\.pdf$/i.test(filename),
    }
  } catch (error) {
    console.error("❌ Failed to parse fal.ai URL:", error)
    return null
  }
}
