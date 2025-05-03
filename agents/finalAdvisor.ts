import { Portfolio } from '@/types';
import { OpenAI } from 'openai';

export interface FinalAdvisorInput {
  portfolio: Portfolio;
  analystSignals: Record<string, any>; // 各大师分析信号
  portfolioManagerResult: any; // 组合建议结果
  riskManagerResult: any; // 风控分析结果
  apiKey: string;
}

export interface FinalAdvisorOutput {
  summary: string;
  risk: string;
  actions: Array<{
    ticker: string;
    suggestion: string;
    quantity: number;
    reason: string;
  }>;
}

export async function finalAdvisorAgent({
  portfolio,
  analystSignals,
  portfolioManagerResult,
  riskManagerResult,
  apiKey
}: FinalAdvisorInput): Promise<FinalAdvisorOutput> {
  const openai = new OpenAI({ apiKey });
  const systemPrompt = `You are a professional portfolio advisor. Based on the following analysis results, provide a final investment suggestion for the user, including:
1. Overall suggestion (e.g., continue to hold, moderately increase position, reduce position, wait and see, etc.)
2. Main reasons (cite key conclusions from agent analysis, risk control, portfolio suggestions, etc.)
3. Risk reminder (e.g., position too concentrated, low cash, etc.)
4. Actionable checklist (e.g., suggest which stocks to buy/sell, quantity, reason)

Please output in concise, professional, and user-friendly English. Return the result in JSON format as follows:
{
  "summary": "Overall suggestion",
  "risk": "Risk reminder",
  "actions": [
    { "ticker": "AAPL", "suggestion": "SELL", "quantity": 100, "reason": "..." },
    ...
  ]
}`;

  const userPrompt = `【大师分析结果】\n${JSON.stringify(analystSignals, null, 2)}\n\n【风控分析】\n${JSON.stringify(riskManagerResult, null, 2)}\n\n【组合建议】\n${JSON.stringify(portfolioManagerResult, null, 2)}\n\n【用户持仓】\n${JSON.stringify(portfolio, null, 2)}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 800
    });
    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response from OpenAI');
    // 解析JSON，清理控制字符
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const cleanJson = jsonMatch[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      try {
        const result = JSON.parse(cleanJson) as FinalAdvisorOutput;
        return result;
      } catch (parseError) {
        console.error('[FinalAdvisor] JSON parse error:', parseError, '\n原始内容:', cleanJson);
        throw parseError;
      }
    }
    throw new Error('Unable to extract JSON from response');
  } catch (error) {
    console.error('[FinalAdvisor] OpenAI 调用异常:', error);
    return {
      summary: '分析异常，建议保持观望。',
      risk: '分析链路异常，无法评估风险。',
      actions: []
    };
  }
} 