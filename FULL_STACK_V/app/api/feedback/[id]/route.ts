import { type NextRequest, NextResponse } from "next/server"
import { getFeedbackById, updateFeedbackStatus, deleteFeedback } from "@/backend/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const feedback = await getFeedbackById(params.id)
    
    if (!feedback) {
      return NextResponse.json({ error: "الرأي غير موجود" }, { status: 404 })
    }
    
    return NextResponse.json(feedback)
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, isPublic, adminNotes } = await request.json()
    
    const success = await updateFeedbackStatus(params.id, status, isPublic, adminNotes)
    
    if (!success) {
      return NextResponse.json({ error: "فشل في تحديث الرأي" }, { status: 400 })
    }
    
    return NextResponse.json({ message: "تم تحديث الرأي بنجاح" })
  } catch (error) {
    console.error("Error updating feedback:", error)
    return NextResponse.json({ error: "فشل في تحديث الرأي" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteFeedback(params.id)
    
    if (!success) {
      return NextResponse.json({ error: "فشل في حذف الرأي" }, { status: 400 })
    }
    
    return NextResponse.json({ message: "تم حذف الرأي بنجاح" })
  } catch (error) {
    console.error("Error deleting feedback:", error)
    return NextResponse.json({ error: "فشل في حذف الرأي" }, { status: 500 })
  }
} 