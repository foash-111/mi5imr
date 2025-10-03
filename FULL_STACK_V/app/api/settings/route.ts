import { type NextRequest, NextResponse } from "next/server"
import { getSettings, updateSettings } from "@/backend/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options"

export async function GET() {
  try {
    const settings = await getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب إعدادات التواصل" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }
  try {
    const data = await request.json()
    const success = await updateSettings(data, session.user._id)
    if (!success) {
      return NextResponse.json({ error: "فشل في تحديث الإعدادات" }, { status: 400 })
    }
    return NextResponse.json({ message: "تم تحديث الإعدادات بنجاح" })
  } catch (error) {
    return NextResponse.json({ error: "فشل في تحديث الإعدادات" }, { status: 500 })
  }
} 