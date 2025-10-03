import { NextRequest, NextResponse } from 'next/server';
import { getContentTypeDistribution } from '@/backend/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    const data = await getContentTypeDistribution();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch content type distribution' }, { status: 500 });
  }
} 