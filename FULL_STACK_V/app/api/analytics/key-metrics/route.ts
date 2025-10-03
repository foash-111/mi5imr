import { NextRequest, NextResponse } from "next/server";
import { getKeyMetrics } from "@/backend/lib/db";

export async function GET(request: NextRequest) {
  try {
    const metrics = await getKeyMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching key metrics:", error);
    return NextResponse.json({ error: "Failed to fetch key metrics" }, { status: 500 });
  }
} 