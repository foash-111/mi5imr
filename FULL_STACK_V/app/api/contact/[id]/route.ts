import { type NextRequest, NextResponse } from "next/server"
import { getContactMessageById, updateContactMessageStatus, replyToContactMessage, deleteContactMessage } from "@/backend/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contactMessage = await getContactMessageById(params.id)
    
    if (!contactMessage) {
      return NextResponse.json({ error: "الرسالة غير موجودة" }, { status: 404 })
    }
    
    return NextResponse.json(contactMessage)
  } catch (error) {
    console.error("Error fetching contact message:", error)
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, adminReply, repliedBy } = await request.json()
    
    let success = false
    
    if (adminReply && repliedBy) {
      success = await replyToContactMessage(params.id, adminReply, repliedBy)
    } else if (status) {
      success = await updateContactMessageStatus(params.id, status)
    }
    
    if (!success) {
      return NextResponse.json({ error: "فشل في تحديث الرسالة" }, { status: 400 })
    }
    
    return NextResponse.json({ message: "تم تحديث الرسالة بنجاح" })
  } catch (error) {
    console.error("Error updating contact message:", error)
    return NextResponse.json({ error: "فشل في تحديث الرسالة" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteContactMessage(params.id)
    
    if (!success) {
      return NextResponse.json({ error: "فشل في حذف الرسالة" }, { status: 400 })
    }
    
    return NextResponse.json({ message: "تم حذف الرسالة بنجاح" })
  } catch (error) {
    console.error("Error deleting contact message:", error)
    return NextResponse.json({ error: "فشل في حذف الرسالة" }, { status: 500 })
  }
} 