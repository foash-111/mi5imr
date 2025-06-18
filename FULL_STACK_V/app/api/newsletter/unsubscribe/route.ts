import { type NextRequest, NextResponse } from "next/server"
import { unsubscribeByToken } from "@/backend/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Unsubscribe token required" }, { status: 400 })
    }

    const success = await unsubscribeByToken(token)

    if (!success) {
      return NextResponse.json({ error: "Invalid unsubscribe token" }, { status: 404 })
    }

    return NextResponse.json({ message: "Successfully unsubscribed from newsletter" })
  } catch (error) {
    console.error("Error unsubscribing from newsletter:", error)
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 })
  }
}
