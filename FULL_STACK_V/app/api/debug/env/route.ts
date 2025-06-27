import { NextResponse } from "next/server"

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Debug endpoint only available in development" }, { status: 403 })
  }

  const envCheck = {
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    MONGODB_URI: !!process.env.MONGODB_URI,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || "Not set",
  }

  const missingVars = Object.entries(envCheck)
    .filter(([key, value]) => key !== "ADMIN_EMAIL" && !value)
    .map(([key]) => key)

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    envCheck,
    missingVariables: missingVars,
    hasAllRequired: missingVars.length === 0,
    timestamp: new Date().toISOString(),
  })
} 