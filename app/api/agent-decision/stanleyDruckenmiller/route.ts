import { NextResponse } from 'next/server';
import { generateDruckenmillerOutput } from '@/agents/stanleyDruckenmiller';

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
    console.log('[API Route /agent-decision/stanleyDruckenmiller] 收到 ticker:', ticker);
    console.log('[API Route /agent-decision/stanleyDruckenmiller] 收到 analysisData:', JSON.stringify(analysisData, null, 2));

    // 读取 OpenAI Key
    const apiKey = process.env.OPENAI_API_KEY || '';
    console.log(`[API Route] OpenAI Key from env: ${apiKey ? '已加载 (开头:' + apiKey.slice(0, 5) + '...)' : '未设置'}`);
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API Key 未配置' }, { status: 500 });
    }

    // 调用智能体主函数
    const result = await generateDruckenmillerOutput(ticker, analysisData, apiKey);
    console.log('[API Route /agent-decision/stanleyDruckenmiller] 智能体返回:', result);
    console.log('[API Route /agent-decision/stanleyDruckenmiller] 返回结果:', JSON.stringify(result, null, 2));
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[API Route /agent-decision/stanleyDruckenmiller] 错误:', err);
    return NextResponse.json({ error: err?.message || '未知错误' }, { status: 500 });
  }
} 