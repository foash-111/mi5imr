import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getDb } from "@/backend/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    
    // Find the subscriber by email
    const subscriber = await db.collection("subscribers").findOne({ 
      email: session.user.email,
      isActive: true 
    })

    if (!subscriber) {
      return NextResponse.json({ error: "Not subscribed to newsletter" }, { status: 404 })
    }

    // Deactivate the subscription
    await db.collection("subscribers").updateOne(
      { email: session.user.email },
      {
        $set: {
          isActive: false,
          unsubscribedAt: new Date(),
        },
      }
    )

    return NextResponse.json({ 
      message: "Successfully unsubscribed from newsletter",
      unsubscribedAt: new Date()
    })
  } catch (error) {
    console.error("Error unsubscribing from newsletter:", error)
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 })
  }
} 