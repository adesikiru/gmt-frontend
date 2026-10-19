import { NextRequest, NextResponse } from 'next/server';
import { fetchInecPollingUnits } from '@/lib/inec';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wardId = searchParams.get('wardId');

  if (!wardId) {
    return NextResponse.json(
      { success: false, message: 'wardId query parameter is required' },
      { status: 400 },
    );
  }

  try {
    const pus = await fetchInecPollingUnits(wardId);
    return NextResponse.json({
      success: true,
      data: pus,
      count: pus.length,
    });
  } catch (error) {
    console.error(`Error fetching INEC polling units for ward ${wardId}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch polling units from INEC portal',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 },
    );
  }
}
