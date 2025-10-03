import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getUserByEmail } from "@/backend/lib/db"
import { getSignupsByDay } from '@/backend/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const user = await getUserByEmail(session.user.email)
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    
    const signups = await getSignupsByDay(month || undefined);
    return NextResponse.json(signups)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch signups data" }, { status: 500 })
  }
}
