import { fal } from "@fal-ai/client"

if (typeof window !== "undefined") {
  fal.config({ credentials: process.env.NEXT_PUBLIC_FAL_KEY })
}

export async function uploadToFalStorage(file: File): Promise<string> {
  if (!process.env.NEXT_PUBLIC_FAL_KEY) throw new Error("FAL_KEY not configured")
  const url = await fal.storage.upload(file)
  return url
}

export async function fileFromDataUrl(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type })
}
