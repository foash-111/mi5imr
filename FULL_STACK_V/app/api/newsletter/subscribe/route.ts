import { type NextRequest, NextResponse } from "next/server"
import { createSubscriber } from "@/backend/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    const subscriber = await createSubscriber(email)

    return NextResponse.json({
      message: "Successfully subscribed to newsletter",
      subscriber: { email: subscriber.email, subscribedAt: subscriber.subscribedAt },
    })
  } catch (error: any) {
    if (error.message === "Email already subscribed") {
      return NextResponse.json({ error: "Email already subscribed" }, { status: 409 })
    }

    console.error("Error subscribing to newsletter:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
