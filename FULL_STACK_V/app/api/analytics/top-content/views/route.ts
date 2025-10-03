import { NextRequest, NextResponse } from 'next/server';
import { getTopPostsByViewsPaginated } from '@/backend/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const [posts, total] = await getTopPostsByViewsPaginated(skip, limit);
    return NextResponse.json({ posts, total });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch top posts by views' }, { status: 500 });
  }
} 