import { NextRequest, NextResponse } from "next/server";
import { getPerformanceMetrics, getUserByEmail } from "@/backend/lib/db";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await getUserByEmail(session.user.email);
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    const metrics = await getPerformanceMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    return NextResponse.json({ error: "Failed to fetch performance metrics" }, { status: 500 });
  }
} 