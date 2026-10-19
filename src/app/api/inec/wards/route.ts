import { NextRequest, NextResponse } from 'next/server';
import { fetchInecWards } from '@/lib/inec';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lgaId = searchParams.get('lgaId');

  if (!lgaId) {
    return NextResponse.json(
      { success: false, message: 'lgaId query parameter is required' },
      { status: 400 },
    );
  }

  try {
    const wards = await fetchInecWards(lgaId);
    return NextResponse.json({
      success: true,
      data: wards,
      count: wards.length,
    });
  } catch (error) {
    console.error(`Error fetching INEC wards for LGA ${lgaId}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch wards from INEC portal',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 },
    );
  }
}
