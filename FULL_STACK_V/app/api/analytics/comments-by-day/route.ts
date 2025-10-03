import { NextRequest, NextResponse } from 'next/server';
import { getCommentsByDay } from '@/backend/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    const data = await getCommentsByDay();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments by day' }, { status: 500 });
  }
} 