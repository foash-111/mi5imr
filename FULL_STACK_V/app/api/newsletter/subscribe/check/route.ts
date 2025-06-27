import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/backend/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }
    const db = await getDb()
    const subscriber = await db.collection("subscribers").findOne({ email, isActive: true })
    return NextResponse.json({ subscribed: !!subscriber })
  } catch (error) {
    return NextResponse.json({ error: "Failed to check subscription" }, { status: 500 })
  }
} 