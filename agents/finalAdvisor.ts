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
  const systemPrompt = `你是一个专业的投资组合顾问，请根据以下所有分析结果，给出一份面向用户的最终投资建议，内容包括：\n1. 总体建议（如继续持有、适度加仓、减仓、观望等）\n2. 主要理由（引用大师分析、风控、组合建议等核心结论）\n3. 风险提示（如持仓过于集中、现金过低等）\n4. 可操作清单（如建议卖出/买入哪些股票、数量、理由）\n\n请用简明、专业、面向普通投资者的语言输出，最后用JSON格式返回：\n{\n  "summary": "总体建议",\n  "risk": "风险提示",\n  "actions": [\n    { "ticker": "AAPL", "suggestion": "SELL", "quantity": 100, "reason": "..." },\n    ...\n  ]\n}`;

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