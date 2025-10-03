import { NextRequest, NextResponse } from 'next/server';
import { getTopUsersByEngagementPaginated } from '@/backend/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const [users, total] = await getTopUsersByEngagementPaginated(skip, limit);
    return NextResponse.json({ users, total });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch top users by engagement' }, { status: 500 });
  }
} 