import { NextResponse } from 'next/server';
import { generateLynchOutput } from '@/agents/peterLynch';

export async function POST(request: Request) {
  try {
    // 解析请求体
    const body = await request.json();
    const { ticker, analysisData } = body;
    if (!ticker || !analysisData) {
      return NextResponse.json(
        { error: '缺少 ticker 或 analysisData' },
        { status: 400 }
      );
    }

    // 日志输出
    console.log('[API Route /agent-decision/peterLynch] 收到 ticker:', ticker);
    console.log('[API Route /agent-decision/peterLynch] 收到 analysisData:', JSON.stringify(analysisData, null, 2));

    // 读取 OpenAI Key
    const apiKey = process.env.OPENAI_API_KEY || '';
    console.log(`[API Route] OpenAI Key from env: ${apiKey ? '已加载 (开头: ' + apiKey.substring(0, 5) + ')' : '未加载'}`);
    if (!apiKey || !apiKey.startsWith('sk-')) {
      return NextResponse.json(
        { error: 'OpenAI API Key 未配置或格式错误' },
        { status: 500 }
      );
    }

    // 调用 Peter Lynch 智能体分析
    const result = await generateLynchOutput(ticker, analysisData, apiKey);
    console.log('[API Route /agent-decision/peterLynch] 返回结果:', JSON.stringify(result, null, 2));
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Peter Lynch 分析出错:', error);
    return NextResponse.json(
      { error: '分析失败', message: error.message, signal: 'neutral', confidence: 0, reasoning: '分析过程中出现错误，建议观望。' },
      { status: 500 }
    );
  }
} 