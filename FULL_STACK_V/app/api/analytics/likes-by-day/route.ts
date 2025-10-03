import { NextRequest, NextResponse } from 'next/server';
import { getLikesByDay } from '@/backend/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    const data = await getLikesByDay();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch likes by day' }, { status: 500 });
  }
} 