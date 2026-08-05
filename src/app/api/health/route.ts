import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/health
 * Health check endpoint - verifica se o servidor está funcionando
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
}
