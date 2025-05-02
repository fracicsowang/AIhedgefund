import { NextResponse } from 'next/server';
import { generateCathieWoodOutput } from '@/agents/cathieWood';
import { StockData } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.stockData) {
      return NextResponse.json(
        { error: 'Missing stock data' },
        { status: 400 }
      );
    }
    // 日志：收到的 stockData
    console.log('[API Route /agent-decision/cathieWood] Received stockData:', JSON.stringify(body.stockData, null, 2));
    // 获取 OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY || '';
    console.log(`[API Route] OpenAI Key from env: ${apiKey ? 'Loaded (starts with ' + apiKey.substring(0, 5) + ')' : 'NOT LOADED'}`);
    const useOpenAI = apiKey && apiKey.trim() !== '' && apiKey.startsWith('sk-');
    try {
      console.log('[API Route /agent-decision/cathieWood] 调用 generateCathieWoodOutput...');
      const ticker = body.stockData.symbol || '';
      const result = await generateCathieWoodOutput(ticker, body.stockData, useOpenAI ? apiKey : '');
      console.log('[API Route /agent-decision/cathieWood] OpenAI/LLM 返回:', result);
      return NextResponse.json(result);
    } catch (err: any) {
      console.error('[API Route /agent-decision/cathieWood] Error:', err);
      return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Cathie Wood分析出错:', error);
    return NextResponse.json(
      { error: '分析失败', message: error.message, signal: 'neutral', reasoning: '分析过程中出现错误，建议持有等待更多数据。' },
      { status: 500 }
    );
  }
} 