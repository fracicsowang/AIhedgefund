import { NextRequest, NextResponse } from 'next/server';
import { finalAdvisorAgent } from '@/agents/finalAdvisor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { portfolio, analystSignals, portfolioManagerResult, riskManagerResult } = body;
    if (!portfolio || !analystSignals || !portfolioManagerResult || !riskManagerResult) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }
    const result = await finalAdvisorAgent({ portfolio, analystSignals, portfolioManagerResult, riskManagerResult, apiKey });
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('[API Route /agent-decision/finalAdvisor] error:', e);
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
} 