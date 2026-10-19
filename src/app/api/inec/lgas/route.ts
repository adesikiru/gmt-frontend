import { NextRequest, NextResponse } from 'next/server';
import { fetchInecLgas } from '@/lib/inec';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stateId = searchParams.get('stateId');

  if (!stateId) {
    return NextResponse.json(
      { success: false, message: 'stateId query parameter is required' },
      { status: 400 },
    );
  }

  try {
    const lgas = await fetchInecLgas(stateId);
    return NextResponse.json({
      success: true,
      data: lgas,
      count: lgas.length,
    });
  } catch (error) {
    console.error(`Error fetching INEC LGAs for state ${stateId}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch LGAs from INEC portal',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 },
    );
  }
}
