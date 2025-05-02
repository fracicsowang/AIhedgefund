import { NextRequest, NextResponse } from 'next/server';
import { riskManagerAgent, Portfolio } from '@/agents/riskManager';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const portfolio: Portfolio = body.portfolio;
    const tickers: string[] = body.tickers;
    if (!portfolio || !Array.isArray(tickers)) {
      return NextResponse.json({ error: 'Missing portfolio or tickers' }, { status: 400 });
    }
    const result = await riskManagerAgent(portfolio, tickers);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('[API Route /agent-decision/riskManager] error:', e);
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}
