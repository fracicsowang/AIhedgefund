import { NextResponse } from 'next/server';
import { buffettAgent } from '@/agents/warrenBuffett';

export async function POST(request: Request) {
  try {
    // 解析请求体
    const body = await request.json();
    const { stockData } = body;
    if (!stockData) {
      return NextResponse.json(
        { error: '缺少 stockData' },
        { status: 400 }
      );
    }

    // 日志输出
    console.log('[API Route /agent-decision/warrenBuffett] 收到 stockData:', JSON.stringify(stockData, null, 2));

    // 读取 OpenAI Key
    const apiKey = process.env.OPENAI_API_KEY || '';
    console.log(`[API Route] OpenAI Key from env: ${apiKey ? '已加载 (开头:' + apiKey.slice(0, 8) + '...)' : '未设置'}`);

    // 调用智能体前日志
    console.log('[API Route /agent-decision/warrenBuffett] 即将调用 buffettAgent...');
    const result = await buffettAgent(stockData, apiKey);
    console.log('[API Route /agent-decision/warrenBuffett] buffettAgent 返回:', result);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[API Route /agent-decision/warrenBuffett] 异常:', err);
    return NextResponse.json({ error: err.message || '服务器异常' }, { status: 500 });
  }
} 