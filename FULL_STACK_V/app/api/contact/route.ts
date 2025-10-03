import { type NextRequest, NextResponse } from "next/server"
import { createContactMessage, getAllContactMessages, getContactMessageStats } from "@/backend/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "عنوان البريد الإلكتروني غير صحيح" }, { status: 400 })
    }

    const contactMessage = await createContactMessage({
      name,
      email,
      subject,
      message,
      status: "unread"
    })

    return NextResponse.json({
      message: "تم إرسال رسالتك بنجاح",
      contactMessage: { id: contactMessage._id, name: contactMessage.name }
    })
  } catch (error) {
    console.error("Error creating contact message:", error)
    return NextResponse.json({ error: "فشل في إرسال الرسالة" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stats = searchParams.get("stats")
    
    if (stats === "true") {
      const contactStats = await getContactMessageStats()
      return NextResponse.json(contactStats)
    }
    
    const contactMessages = await getAllContactMessages()
    return NextResponse.json(contactMessages)
  } catch (error) {
    console.error("Error fetching contact messages:", error)
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 })
  }
} 