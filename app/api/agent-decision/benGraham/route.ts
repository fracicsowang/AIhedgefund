import { NextResponse } from 'next/server';
import { benGrahamStrategy } from '@/agents/benGraham';
import { StockData } from '@/types';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    if (!body.stockData) {
      return NextResponse.json(
        { error: 'Missing stock data' },
        { status: 400 }
      );
    }

    // Log received stockData for debugging
    console.log('[API Route /agent-decision/benGraham] Received stockData:', JSON.stringify(body.stockData, null, 2));

    // Use OpenAI API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY || '';
    console.log(`[API Route] OpenAI Key from env: ${apiKey ? 'Loaded (starts with ' + apiKey.substring(0, 5) + ')' : 'NOT LOADED'}`);
    const useOpenAI = apiKey && apiKey.trim() !== '' && apiKey.startsWith('sk-');

    // Call the real benGrahamStrategy from agents/benGraham.ts
    const result = await benGrahamStrategy(body.stockData as StockData, useOpenAI ? apiKey : null);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Ben Graham分析出错:', error);
    return NextResponse.json(
      { error: '分析失败', message: error.message, decision: 'HOLD', reasoning: '分析过程中出现错误，建议持有等待更多数据。' },
      { status: 500 }
    );
  }
} 