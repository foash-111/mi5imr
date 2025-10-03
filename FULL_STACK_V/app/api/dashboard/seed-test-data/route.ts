import { NextResponse } from "next/server";
import { seedTestContentData } from "@/backend/lib/db";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Seeding is only allowed in development mode." }, { status: 403 });
  }
  const result = await seedTestContentData();
  return NextResponse.json(result);
} 