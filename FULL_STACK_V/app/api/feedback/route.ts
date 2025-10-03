import { type NextRequest, NextResponse } from "next/server"
import { createFeedback, getAllFeedback, getFeedbackStats } from "@/backend/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { name, email, role, message } = await request.json()

    if (!name || !email || !role || !message) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "عنوان البريد الإلكتروني غير صحيح" }, { status: 400 })
    }

    const feedback = await createFeedback({
      name,
      email,
      role,
      message,
      status: "pending",
      isPublic: false
    })

    return NextResponse.json({
      message: "تم إرسال رأيك بنجاح",
      feedback: { id: feedback._id, name: feedback.name }
    })
  } catch (error) {
    console.error("Error creating feedback:", error)
    return NextResponse.json({ error: "فشل في إرسال الرأي" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stats = searchParams.get("stats")
    
    if (stats === "true") {
      const feedbackStats = await getFeedbackStats()
      return NextResponse.json(feedbackStats)
    }
    
    const feedback = await getAllFeedback()
    return NextResponse.json(feedback)
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 })
  }
} 