import { NextResponse } from 'next/server';
import { INEC_STATES } from '@/lib/inec';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: INEC_STATES,
  });
}
