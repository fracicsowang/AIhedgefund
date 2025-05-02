import { NextResponse } from 'next/server';
import { generateAckmanOutput } from '@/agents/billAckman';
import { StockData } from '@/types';

export async function POST(request: Request) {
  try {
    // 解析请求体
    const body = await request.json();
    if (!body.stockData) {
      return NextResponse.json(
        { error: 'Missing stock data' },
        { status: 400 }
      );
    }

    // 日志：收到的 stockData
    console.log('[API Route /agent-decision/billAckman] Received stockData:', JSON.stringify(body.stockData, null, 2));

    // 获取 OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY || '';
    console.log(`[API Route] OpenAI Key from env: ${apiKey ? 'Loaded (starts with ' + apiKey.substring(0, 5) + ')' : 'NOT LOADED'}`);
    const useOpenAI = apiKey && apiKey.trim() !== '' && apiKey.startsWith('sk-');

    // 组装 analysisData（可根据需要调整）
    const analysisData = body.analysisData || body.stockData;
    const ticker = body.stockData.symbol || '';

    // 调用 Ackman 智能体
    let result;
    if (useOpenAI) {
      result = await generateAckmanOutput(ticker, analysisData, apiKey);
    } else {
      // fallback: 返回默认 neutral
      result = {
        signal: 'neutral',
        confidence: 0,
        reasoning: 'OpenAI API key not set, cannot perform Ackman LLM analysis.'
      };
    }
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Bill Ackman分析出错:', error);
    return NextResponse.json(
      { error: '分析失败', message: error.message, signal: 'neutral', reasoning: '分析过程中出现错误，建议持有等待更多数据。' },
      { status: 500 }
    );
  }
} 