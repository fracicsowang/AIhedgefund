import { OpenAI } from 'openai';
import { StockData } from '@/types';

export type MichaelBurrySignal = {
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  reasoning: string;
};

// --- 分析模块 ---

function latestLineItem(lineItems: any[]): any | null {
  return lineItems && lineItems.length > 0 ? lineItems[0] : null;
}

function analyzeValue(metrics: any[], lineItems: any[], marketCap: number): { score: number; max_score: number; details: string } {
  const max_score = 6;
  let score = 0;
  const details: string[] = [];
  // FCF yield
  const latest = latestLineItem(lineItems);
  const fcf = latest?.free_cash_flow;
  if (fcf !== undefined && fcf !== null && marketCap) {
    const fcfYield = fcf / marketCap;
    if (fcfYield >= 0.15) {
      score += 4;
      details.push(`Extraordinary FCF yield ${(fcfYield * 100).toFixed(1)}%`);
    } else if (fcfYield >= 0.12) {
      score += 3;
      details.push(`Very high FCF yield ${(fcfYield * 100).toFixed(1)}%`);
    } else if (fcfYield >= 0.08) {
      score += 2;
      details.push(`Respectable FCF yield ${(fcfYield * 100).toFixed(1)}%`);
    } else {
      details.push(`Low FCF yield ${(fcfYield * 100).toFixed(1)}%`);
    }
  } else {
    details.push('FCF data unavailable');
  }
  // EV/EBIT
  if (metrics && metrics.length > 0) {
    const evEbit = metrics[0].ev_to_ebit;
    if (evEbit !== undefined && evEbit !== null) {
      if (evEbit < 6) {
        score += 2;
        details.push(`EV/EBIT ${evEbit.toFixed(1)} (<6)`);
      } else if (evEbit < 10) {
        score += 1;
        details.push(`EV/EBIT ${evEbit.toFixed(1)} (<10)`);
      } else {
        details.push(`High EV/EBIT ${evEbit.toFixed(1)}`);
      }
    } else {
      details.push('EV/EBIT data unavailable');
    }
  } else {
    details.push('Financial metrics unavailable');
  }
  return { score, max_score, details: details.join('; ') };
}

function analyzeBalanceSheet(metrics: any[], lineItems: any[]): { score: number; max_score: number; details: string } {
  const max_score = 3;
  let score = 0;
  const details: string[] = [];
  const latestMetrics = metrics && metrics.length > 0 ? metrics[0] : null;
  const latest = latestLineItem(lineItems);
  const debtToEquity = latestMetrics?.debt_to_equity;
  if (debtToEquity !== undefined && debtToEquity !== null) {
    if (debtToEquity < 0.5) {
      score += 2;
      details.push(`Low D/E ${debtToEquity.toFixed(2)}`);
    } else if (debtToEquity < 1) {
      score += 1;
      details.push(`Moderate D/E ${debtToEquity.toFixed(2)}`);
    } else {
      details.push(`High leverage D/E ${debtToEquity.toFixed(2)}`);
    }
  } else {
    details.push('Debt-to-equity data unavailable');
  }
  // Quick liquidity
  if (latest) {
    const cash = latest.cash_and_equivalents;
    const totalDebt = latest.total_debt;
    if (cash !== undefined && totalDebt !== undefined && cash !== null && totalDebt !== null) {
      if (cash > totalDebt) {
        score += 1;
        details.push('Net cash position');
      } else {
        details.push('Net debt position');
      }
    } else {
      details.push('Cash/debt data unavailable');
    }
  }
  return { score, max_score, details: details.join('; ') };
}

function analyzeInsiderActivity(insiderTrades: any[]): { score: number; max_score: number; details: string } {
  const max_score = 2;
  let score = 0;
  const details: string[] = [];
  if (!insiderTrades || insiderTrades.length === 0) {
    details.push('No insider trade data');
    return { score, max_score, details: details.join('; ') };
  }
  let sharesBought = 0;
  let sharesSold = 0;
  for (const t of insiderTrades) {
    const shares = t.transaction_shares || 0;
    if (shares > 0) sharesBought += shares;
    if (shares < 0) sharesSold += Math.abs(shares);
  }
  const net = sharesBought - sharesSold;
  if (net > 0) {
    score += net / Math.max(sharesSold, 1) > 1 ? 2 : 1;
    details.push(`Net insider buying of ${net.toLocaleString()} shares`);
  } else {
    details.push('Net insider selling');
  }
  return { score, max_score, details: details.join('; ') };
}

function analyzeContrarianSentiment(news: any[]): { score: number; max_score: number; details: string } {
  const max_score = 1;
  let score = 0;
  const details: string[] = [];
  if (!news || news.length === 0) {
    details.push('No recent news');
    return { score, max_score, details: details.join('; ') };
  }
  const sentimentNegativeCount = news.filter((n: any) => n.sentiment && ['negative', 'bearish'].includes(n.sentiment.toLowerCase())).length;
  if (sentimentNegativeCount >= 5) {
    score += 1;
    details.push(`${sentimentNegativeCount} negative headlines (contrarian opportunity)`);
  } else {
    details.push('Limited negative press');
  }
  return { score, max_score, details: details.join('; ') };
}

export async function generateBurryOutput(
  ticker: string,
  analysisData: any,
  apiKey: string
): Promise<MichaelBurrySignal> {
  // 构造 LLM prompt
  const systemPrompt = `You are an AI agent emulating Dr. Michael J. Burry. Your mandate:
- Hunt for deep value in US equities using hard numbers (free cash flow, EV/EBIT, balance sheet)
- Be contrarian: hatred in the press can be your friend if fundamentals are solid
- Focus on downside first – avoid leveraged balance sheets
- Look for hard catalysts such as insider buying, buybacks, or asset sales
- Communicate in Burry's terse, data‑driven style

When providing your reasoning, be thorough and specific by:
1. Start with the key metric(s) that drove your decision
2. Cite concrete numbers (e.g. "FCF yield 14.7%", "EV/EBIT 5.3")
3. Highlight risk factors and why they are acceptable (or not)
4. Mention relevant insider activity or contrarian opportunities
5. Use Burry's direct, number-focused communication style with minimal words

For example, if bullish: "FCF yield 12.8%. EV/EBIT 6.2. Debt-to-equity 0.4. Net insider buying 25k shares. Market missing value due to overreaction to recent litigation. Strong buy."
For example, if bearish: "FCF yield only 2.1%. Debt-to-equity concerning at 2.3. Management diluting shareholders. Pass."
`;
  const userPrompt = `Based on the following data, create the investment signal as Michael Burry would:\n\nAnalysis Data for ${ticker}:\n${JSON.stringify(analysisData, null, 2)}\n\nReturn the trading signal in the following JSON format exactly:\n{\n  "signal": "bullish" | "bearish" | "neutral",\n  "confidence": float between 0 and 100,\n  "reasoning": "string"\n}`;

  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.2,
    max_tokens: 512
  });
  const content = completion.choices[0].message.content || '';
  // 提取 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    // 清理控制字符
    const cleanJson = jsonMatch[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    try {
      const result = JSON.parse(cleanJson) as MichaelBurrySignal;
      console.log('[Burry] OpenAI response:', result);
      return result;
    } catch (parseError) {
      console.error('Burry JSON parse error:', parseError, '\n原始内容:', cleanJson);
      throw parseError;
    }
  }
  throw new Error('Unable to extract JSON from response');
} 