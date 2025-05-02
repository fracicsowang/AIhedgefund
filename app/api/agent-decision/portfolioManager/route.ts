import { NextRequest, NextResponse } from 'next/server';
import { portfolioManagerAgent } from '@/agents/portfolioManager';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { portfolio, analystSignals, tickers, apiKey } = body;
    if (!portfolio || !analystSignals || !Array.isArray(tickers)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const result = await portfolioManagerAgent({ portfolio, analystSignals, tickers, apiKey });
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('[API Route /agent-decision/portfolioManager] error:', e);
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}
