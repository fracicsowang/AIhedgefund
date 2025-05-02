import { OpenAI } from 'openai';
import { StockData } from '@/types';

export type PeterLynchSignal = {
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  reasoning: string;
};

// --- 分析模块 ---

function analyzeLynchGrowth(financialLineItems: any[]): { score: number; details: string } {
  if (!financialLineItems || financialLineItems.length < 2) {
    return { score: 0, details: 'Insufficient financial data for growth analysis' };
  }
  let rawScore = 0;
  const details: string[] = [];
  // Revenue Growth
  const revenues = financialLineItems.map((fi: any) => fi.revenue).filter((v: any) => v !== undefined && v !== null);
  if (revenues.length >= 2) {
    const latestRev = revenues[0];
    const olderRev = revenues[revenues.length - 1];
    if (olderRev > 0) {
      const revGrowth = (latestRev - olderRev) / Math.abs(olderRev);
      if (revGrowth > 0.25) {
        rawScore += 3;
        details.push(`Strong revenue growth: ${(revGrowth * 100).toFixed(1)}%`);
      } else if (revGrowth > 0.10) {
        rawScore += 2;
        details.push(`Moderate revenue growth: ${(revGrowth * 100).toFixed(1)}%`);
      } else if (revGrowth > 0.02) {
        rawScore += 1;
        details.push(`Slight revenue growth: ${(revGrowth * 100).toFixed(1)}%`);
      } else {
        details.push(`Flat or negative revenue growth: ${(revGrowth * 100).toFixed(1)}%`);
      }
    } else {
      details.push("Older revenue is zero/negative; can't compute revenue growth.");
    }
  } else {
    details.push('Not enough revenue data to assess growth.');
  }
  // EPS Growth
  const epsValues = financialLineItems.map((fi: any) => fi.earnings_per_share).filter((v: any) => v !== undefined && v !== null);
  if (epsValues.length >= 2) {
    const latestEps = epsValues[0];
    const olderEps = epsValues[epsValues.length - 1];
    if (Math.abs(olderEps) > 1e-9) {
      const epsGrowth = (latestEps - olderEps) / Math.abs(olderEps);
      if (epsGrowth > 0.25) {
        rawScore += 3;
        details.push(`Strong EPS growth: ${(epsGrowth * 100).toFixed(1)}%`);
      } else if (epsGrowth > 0.10) {
        rawScore += 2;
        details.push(`Moderate EPS growth: ${(epsGrowth * 100).toFixed(1)}%`);
      } else if (epsGrowth > 0.02) {
        rawScore += 1;
        details.push(`Slight EPS growth: ${(epsGrowth * 100).toFixed(1)}%`);
      } else {
        details.push(`Minimal or negative EPS growth: ${(epsGrowth * 100).toFixed(1)}%`);
      }
    } else {
      details.push('Older EPS is near zero; skipping EPS growth calculation.');
    }
  } else {
    details.push('Not enough EPS data for growth calculation.');
  }
  const finalScore = Math.min(10, (rawScore / 6) * 10);
  return { score: finalScore, details: details.join('; ') };
}

function analyzeLynchFundamentals(financialLineItems: any[]): { score: number; details: string } {
  if (!financialLineItems) {
    return { score: 0, details: 'Insufficient fundamentals data' };
  }
  let rawScore = 0;
  const details: string[] = [];
  // Debt-to-Equity
  const debtValues = financialLineItems.map((fi: any) => fi.total_debt).filter((v: any) => v !== undefined && v !== null);
  const eqValues = financialLineItems.map((fi: any) => fi.shareholders_equity).filter((v: any) => v !== undefined && v !== null);
  if (debtValues.length && eqValues.length && debtValues.length === eqValues.length) {
    const recentDebt = debtValues[0];
    const recentEquity = eqValues[0] || 1e-9;
    const deRatio = recentDebt / recentEquity;
    if (deRatio < 0.5) {
      rawScore += 2;
      details.push(`Low debt-to-equity: ${deRatio.toFixed(2)}`);
    } else if (deRatio < 1.0) {
      rawScore += 1;
      details.push(`Moderate debt-to-equity: ${deRatio.toFixed(2)}`);
    } else {
      details.push(`High debt-to-equity: ${deRatio.toFixed(2)}`);
    }
  } else {
    details.push('No consistent debt/equity data available.');
  }
  // Operating Margin
  const omValues = financialLineItems.map((fi: any) => fi.operating_margin).filter((v: any) => v !== undefined && v !== null);
  if (omValues.length) {
    const omRecent = omValues[0];
    if (omRecent > 0.20) {
      rawScore += 2;
      details.push(`Strong operating margin: ${(omRecent * 100).toFixed(1)}%`);
    } else if (omRecent > 0.10) {
      rawScore += 1;
      details.push(`Moderate operating margin: ${(omRecent * 100).toFixed(1)}%`);
    } else {
      details.push(`Low operating margin: ${(omRecent * 100).toFixed(1)}%`);
    }
  } else {
    details.push('No operating margin data available.');
  }
  // Positive Free Cash Flow
  const fcfValues = financialLineItems.map((fi: any) => fi.free_cash_flow).filter((v: any) => v !== undefined && v !== null);
  if (fcfValues.length && fcfValues[0] !== null) {
    if (fcfValues[0] > 0) {
      rawScore += 2;
      details.push(`Positive free cash flow: ${fcfValues[0].toLocaleString()}`);
    } else {
      details.push(`Recent FCF is negative: ${fcfValues[0].toLocaleString()}`);
    }
  } else {
    details.push('No free cash flow data available.');
  }
  const finalScore = Math.min(10, (rawScore / 6) * 10);
  return { score: finalScore, details: details.join('; ') };
}

function analyzeLynchValuation(financialLineItems: any[], marketCap: number): { score: number; details: string } {
  if (!financialLineItems || marketCap == null) {
    return { score: 0, details: 'Insufficient data for valuation' };
  }
  let rawScore = 0;
  const details: string[] = [];
  // P/E
  const netIncomes = financialLineItems.map((fi: any) => fi.net_income).filter((v: any) => v !== undefined && v !== null);
  const epsValues = financialLineItems.map((fi: any) => fi.earnings_per_share).filter((v: any) => v !== undefined && v !== null);
  let peRatio: number | null = null;
  if (netIncomes.length && netIncomes[0] > 0) {
    peRatio = marketCap / netIncomes[0];
    details.push(`Estimated P/E: ${peRatio.toFixed(2)}`);
  } else {
    details.push("No positive net income => can't compute approximate P/E");
  }
  // EPS growth
  let epsGrowthRate: number | null = null;
  if (epsValues.length >= 2) {
    const latestEps = epsValues[0];
    const olderEps = epsValues[epsValues.length - 1];
    if (olderEps > 0) {
      epsGrowthRate = (latestEps - olderEps) / olderEps;
      details.push(`Approx EPS growth rate: ${(epsGrowthRate * 100).toFixed(1)}%`);
    } else {
      details.push('Cannot compute EPS growth rate (older EPS <= 0)');
    }
  } else {
    details.push('Not enough EPS data to compute growth rate');
  }
  // PEG
  let pegRatio: number | null = null;
  if (peRatio && epsGrowthRate && epsGrowthRate > 0) {
    pegRatio = peRatio / (epsGrowthRate * 100);
    details.push(`PEG ratio: ${pegRatio.toFixed(2)}`);
  }
  // Scoring
  if (peRatio !== null) {
    if (peRatio < 15) rawScore += 2;
    else if (peRatio < 25) rawScore += 1;
  }
  if (pegRatio !== null) {
    if (pegRatio < 1) rawScore += 3;
    else if (pegRatio < 2) rawScore += 2;
    else if (pegRatio < 3) rawScore += 1;
  }
  const finalScore = Math.min(10, (rawScore / 5) * 10);
  return { score: finalScore, details: details.join('; ') };
}

function analyzeSentiment(newsItems: any[]): { score: number; details: string } {
  if (!newsItems || newsItems.length === 0) {
    return { score: 5, details: 'No news data; default to neutral sentiment' };
  }
  const negativeKeywords = ['lawsuit', 'fraud', 'negative', 'downturn', 'decline', 'investigation', 'recall'];
  let negativeCount = 0;
  for (const news of newsItems) {
    const titleLower = (news.title || '').toLowerCase();
    if (negativeKeywords.some(word => titleLower.includes(word))) negativeCount++;
  }
  const details: string[] = [];
  let score = 8;
  if (negativeCount > newsItems.length * 0.3) {
    score = 3;
    details.push(`High proportion of negative headlines: ${negativeCount}/${newsItems.length}`);
  } else if (negativeCount > 0) {
    score = 6;
    details.push(`Some negative headlines: ${negativeCount}/${newsItems.length}`);
  } else {
    details.push('Mostly positive or neutral headlines');
  }
  return { score, details: details.join('; ') };
}

function analyzeInsiderActivity(insiderTrades: any[]): { score: number; details: string } {
  let score = 5;
  const details: string[] = [];
  if (!insiderTrades || insiderTrades.length === 0) {
    details.push('No insider trades data; defaulting to neutral');
    return { score, details: details.join('; ') };
  }
  let buys = 0, sells = 0;
  for (const trade of insiderTrades) {
    if (trade.transaction_shares !== undefined && trade.transaction_shares !== null) {
      if (trade.transaction_shares > 0) buys++;
      else if (trade.transaction_shares < 0) sells++;
    }
  }
  const total = buys + sells;
  if (total === 0) {
    details.push('No significant buy/sell transactions found; neutral stance');
    return { score, details: details.join('; ') };
  }
  const buyRatio = buys / total;
  if (buyRatio > 0.7) {
    score = 8;
    details.push(`Heavy insider buying: ${buys} buys vs. ${sells} sells`);
  } else if (buyRatio > 0.4) {
    score = 6;
    details.push(`Moderate insider buying: ${buys} buys vs. ${sells} sells`);
  } else {
    score = 4;
    details.push(`Mostly insider selling: ${buys} buys vs. ${sells} sells`);
  }
  return { score, details: details.join('; ') };
}

export async function generateLynchOutput(
  ticker: string,
  analysisData: any,
  apiKey: string
): Promise<PeterLynchSignal> {
  // 构造 LLM prompt
  const systemPrompt = `You are a Peter Lynch AI agent. You make investment decisions based on Peter Lynch's well-known principles:
                
1. Invest in What You Know: Emphasize understandable businesses, possibly discovered in everyday life.
2. Growth at a Reasonable Price (GARP): Rely on the PEG ratio as a prime metric.
3. Look for 'Ten-Baggers': Companies capable of growing earnings and share price substantially.
4. Steady Growth: Prefer consistent revenue/earnings expansion, less concern about short-term noise.
5. Avoid High Debt: Watch for dangerous leverage.
6. Management & Story: A good 'story' behind the stock, but not overhyped or too complex.
                
When you provide your reasoning, do it in Peter Lynch's voice:
- Cite the PEG ratio
- Mention 'ten-bagger' potential if applicable
- Refer to personal or anecdotal observations (e.g., "If my kids love the product...")
- Use practical, folksy language
- Provide key positives and negatives
- Conclude with a clear stance (bullish, bearish, or neutral)
                
Return your final output strictly in JSON with the fields:
{
  "signal": "bullish" | "bearish" | "neutral",
  "confidence": 0 to 100,
  "reasoning": "string"
}
`;
  const userPrompt = `Based on the following analysis data for ${ticker}, produce your Peter Lynch–style investment signal.\n\nAnalysis Data:\n${JSON.stringify(analysisData, null, 2)}\n\nReturn only valid JSON with \"signal\", \"confidence\", and \"reasoning\".`;

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
  console.log('[Peter Lynch] OpenAI 原始返回内容:', content);
  // 提取 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    // 清理控制字符
    const cleanJson = jsonMatch[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    try {
      const result = JSON.parse(cleanJson) as PeterLynchSignal;
      console.log('[Lynch] OpenAI response:', result);
      return result;
    } catch (parseError) {
      console.error('Lynch JSON parse error:', parseError, '\n原始内容:', cleanJson);
      throw parseError;
    }
  }
  throw new Error('Unable to extract JSON from response');
} 