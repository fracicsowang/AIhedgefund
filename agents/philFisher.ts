import { OpenAI } from 'openai';
import { StockData } from '@/types';

export type PhilFisherSignal = {
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  reasoning: string;
};

// --- 分析模块 ---

function analyzeFisherGrowthQuality(financialLineItems: any[]): { score: number; details: string } {
  if (!financialLineItems || financialLineItems.length < 2) {
    return { score: 0, details: 'Insufficient financial data for growth/quality analysis' };
  }
  let rawScore = 0;
  const details: string[] = [];
  // Revenue Growth
  const revenues = financialLineItems.map((fi: any) => fi.revenue).filter((v: any) => v != null);
  if (revenues.length >= 2) {
    const latestRev = revenues[0];
    const oldestRev = revenues[revenues.length - 1];
    if (oldestRev > 0) {
      const revGrowth = (latestRev - oldestRev) / Math.abs(oldestRev);
      if (revGrowth > 0.80) {
        rawScore += 3;
        details.push(`Very strong multi-period revenue growth: ${(revGrowth * 100).toFixed(1)}%`);
      } else if (revGrowth > 0.40) {
        rawScore += 2;
        details.push(`Moderate multi-period revenue growth: ${(revGrowth * 100).toFixed(1)}%`);
      } else if (revGrowth > 0.10) {
        rawScore += 1;
        details.push(`Slight multi-period revenue growth: ${(revGrowth * 100).toFixed(1)}%`);
      } else {
        details.push(`Minimal or negative multi-period revenue growth: ${(revGrowth * 100).toFixed(1)}%`);
      }
    } else {
      details.push('Oldest revenue is zero/negative; cannot compute growth.');
    }
  } else {
    details.push('Not enough revenue data points for growth calculation.');
  }
  // EPS Growth
  const epsValues = financialLineItems.map((fi: any) => fi.earnings_per_share).filter((v: any) => v != null);
  if (epsValues.length >= 2) {
    const latestEps = epsValues[0];
    const oldestEps = epsValues[epsValues.length - 1];
    if (Math.abs(oldestEps) > 1e-9) {
      const epsGrowth = (latestEps - oldestEps) / Math.abs(oldestEps);
      if (epsGrowth > 0.80) {
        rawScore += 3;
        details.push(`Very strong multi-period EPS growth: ${(epsGrowth * 100).toFixed(1)}%`);
      } else if (epsGrowth > 0.40) {
        rawScore += 2;
        details.push(`Moderate multi-period EPS growth: ${(epsGrowth * 100).toFixed(1)}%`);
      } else if (epsGrowth > 0.10) {
        rawScore += 1;
        details.push(`Slight multi-period EPS growth: ${(epsGrowth * 100).toFixed(1)}%`);
      } else {
        details.push(`Minimal or negative multi-period EPS growth: ${(epsGrowth * 100).toFixed(1)}%`);
      }
    } else {
      details.push('Oldest EPS near zero; skipping EPS growth calculation.');
    }
  } else {
    details.push('Not enough EPS data points for growth calculation.');
  }
  // R&D as % of Revenue
  const rndValues = financialLineItems.map((fi: any) => fi.research_and_development).filter((v: any) => v != null);
  if (rndValues.length && revenues.length && rndValues.length === revenues.length) {
    const recentRnd = rndValues[0];
    const recentRev = revenues[0] || 1e-9;
    const rndRatio = recentRnd / recentRev;
    if (rndRatio >= 0.03 && rndRatio <= 0.15) {
      rawScore += 3;
      details.push(`R&D ratio ${(rndRatio * 100).toFixed(1)}% indicates significant investment in future growth`);
    } else if (rndRatio > 0.15) {
      rawScore += 2;
      details.push(`R&D ratio ${(rndRatio * 100).toFixed(1)}% is very high (could be good if well-managed)`);
    } else if (rndRatio > 0.0) {
      rawScore += 1;
      details.push(`R&D ratio ${(rndRatio * 100).toFixed(1)}% is somewhat low but still positive`);
    } else {
      details.push('No meaningful R&D expense ratio');
    }
  } else {
    details.push('Insufficient R&D data to evaluate');
  }
  const finalScore = Math.min(10, (rawScore / 9) * 10);
  return { score: finalScore, details: details.join('; ') };
}

function analyzeMarginsStability(financialLineItems: any[]): { score: number; details: string } {
  if (!financialLineItems || financialLineItems.length < 2) {
    return { score: 0, details: 'Insufficient data for margin stability analysis' };
  }
  let rawScore = 0;
  const details: string[] = [];
  // Operating Margin Consistency
  const opMargins = financialLineItems.map((fi: any) => fi.operating_margin).filter((v: any) => v != null);
  if (opMargins.length >= 2) {
    const oldestOp = opMargins[opMargins.length - 1];
    const newestOp = opMargins[0];
    if (newestOp >= oldestOp && oldestOp > 0) {
      rawScore += 2;
      details.push(`Operating margin stable or improving (${(oldestOp * 100).toFixed(1)}% -> ${(newestOp * 100).toFixed(1)}%)`);
    } else if (newestOp > 0) {
      rawScore += 1;
      details.push('Operating margin positive but slightly declined');
    } else {
      details.push('Operating margin may be negative or uncertain');
    }
  } else {
    details.push('Not enough operating margin data points');
  }
  // Gross Margin Level
  const gmValues = financialLineItems.map((fi: any) => fi.gross_margin).filter((v: any) => v != null);
  if (gmValues.length) {
    const recentGm = gmValues[0];
    if (recentGm > 0.5) {
      rawScore += 2;
      details.push(`Strong gross margin: ${(recentGm * 100).toFixed(1)}%`);
    } else if (recentGm > 0.3) {
      rawScore += 1;
      details.push(`Moderate gross margin: ${(recentGm * 100).toFixed(1)}%`);
    } else {
      details.push(`Low gross margin: ${(recentGm * 100).toFixed(1)}%`);
    }
  } else {
    details.push('No gross margin data available');
  }
  // Multi-year Margin Stability
  if (opMargins.length >= 3) {
    const mean = opMargins.reduce((a, b) => a + b, 0) / opMargins.length;
    const stdev = Math.sqrt(opMargins.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / opMargins.length);
    if (stdev < 0.02) {
      rawScore += 2;
      details.push('Operating margin extremely stable over multiple years');
    } else if (stdev < 0.05) {
      rawScore += 1;
      details.push('Operating margin reasonably stable');
    } else {
      details.push('Operating margin volatility is high');
    }
  } else {
    details.push('Not enough margin data points for volatility check');
  }
  const finalScore = Math.min(10, (rawScore / 6) * 10);
  return { score: finalScore, details: details.join('; ') };
}

function analyzeManagementEfficiencyLeverage(financialLineItems: any[]): { score: number; details: string } {
  if (!financialLineItems) {
    return { score: 0, details: 'No financial data for management efficiency analysis' };
  }
  let rawScore = 0;
  const details: string[] = [];
  // ROE
  const niValues = financialLineItems.map((fi: any) => fi.net_income).filter((v: any) => v != null);
  const eqValues = financialLineItems.map((fi: any) => fi.shareholders_equity).filter((v: any) => v != null);
  if (niValues.length && eqValues.length && niValues.length === eqValues.length) {
    const recentNi = niValues[0];
    const recentEq = eqValues[0] || 1e-9;
    if (recentNi > 0) {
      const roe = recentNi / recentEq;
      if (roe > 0.2) {
        rawScore += 3;
        details.push(`High ROE: ${(roe * 100).toFixed(1)}%`);
      } else if (roe > 0.1) {
        rawScore += 2;
        details.push(`Moderate ROE: ${(roe * 100).toFixed(1)}%`);
      } else if (roe > 0) {
        rawScore += 1;
        details.push(`Positive but low ROE: ${(roe * 100).toFixed(1)}%`);
      } else {
        details.push(`ROE is near zero or negative: ${(roe * 100).toFixed(1)}%`);
      }
    } else {
      details.push('Recent net income is zero or negative, hurting ROE');
    }
  } else {
    details.push('Insufficient data for ROE calculation');
  }
  // Debt-to-Equity
  const debtValues = financialLineItems.map((fi: any) => fi.total_debt).filter((v: any) => v != null);
  if (debtValues.length && eqValues.length && debtValues.length === eqValues.length) {
    const recentDebt = debtValues[0];
    const recentEquity = eqValues[0] || 1e-9;
    const dte = recentDebt / recentEquity;
    if (dte < 0.3) {
      rawScore += 2;
      details.push(`Low debt-to-equity: ${dte.toFixed(2)}`);
    } else if (dte < 1.0) {
      rawScore += 1;
      details.push(`Manageable debt-to-equity: ${dte.toFixed(2)}`);
    } else {
      details.push(`High debt-to-equity: ${dte.toFixed(2)}`);
    }
  } else {
    details.push('Insufficient data for debt/equity analysis');
  }
  // FCF Consistency
  const fcfValues = financialLineItems.map((fi: any) => fi.free_cash_flow).filter((v: any) => v != null);
  if (fcfValues.length >= 2) {
    const positiveFcfCount = fcfValues.filter((x: number) => x > 0).length;
    const ratio = positiveFcfCount / fcfValues.length;
    if (ratio > 0.8) {
      rawScore += 1;
      details.push(`Majority of periods have positive FCF (${positiveFcfCount}/${fcfValues.length})`);
    } else {
      details.push('Free cash flow is inconsistent or often negative');
    }
  } else {
    details.push('Insufficient or no FCF data to check consistency');
  }
  const finalScore = Math.min(10, (rawScore / 6) * 10);
  return { score: finalScore, details: details.join('; ') };
}

function analyzeFisherValuation(financialLineItems: any[], marketCap: number): { score: number; details: string } {
  if (!financialLineItems || marketCap == null) {
    return { score: 0, details: 'Insufficient data to perform valuation' };
  }
  let rawScore = 0;
  const details: string[] = [];
  // P/E
  const netIncomes = financialLineItems.map((fi: any) => fi.net_income).filter((v: any) => v != null);
  const fcfValues = financialLineItems.map((fi: any) => fi.free_cash_flow).filter((v: any) => v != null);
  const recentNetIncome = netIncomes[0];
  if (recentNetIncome && recentNetIncome > 0) {
    const pe = marketCap / recentNetIncome;
    if (pe < 20) {
      rawScore += 2;
      details.push(`Reasonably attractive P/E: ${pe.toFixed(2)}`);
    } else if (pe < 30) {
      rawScore += 1;
      details.push(`Somewhat high but possibly justifiable P/E: ${pe.toFixed(2)}`);
    } else {
      details.push(`Very high P/E: ${pe.toFixed(2)}`);
    }
  } else {
    details.push('No positive net income for P/E calculation');
  }
  // P/FCF
  const recentFcf = fcfValues[0];
  if (recentFcf && recentFcf > 0) {
    const pfcf = marketCap / recentFcf;
    if (pfcf < 20) {
      rawScore += 2;
      details.push(`Reasonable P/FCF: ${pfcf.toFixed(2)}`);
    } else if (pfcf < 30) {
      rawScore += 1;
      details.push(`Somewhat high P/FCF: ${pfcf.toFixed(2)}`);
    } else {
      details.push(`Excessively high P/FCF: ${pfcf.toFixed(2)}`);
    }
  } else {
    details.push('No positive free cash flow for P/FCF calculation');
  }
  const finalScore = Math.min(10, (rawScore / 4) * 10);
  return { score: finalScore, details: details.join('; ') };
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
    details.push('No buy/sell transactions found; neutral');
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

function analyzeSentiment(newsItems: any[]): { score: number; details: string } {
  if (!newsItems || newsItems.length === 0) {
    return { score: 5, details: 'No news data; defaulting to neutral sentiment' };
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
    details.push('Mostly positive/neutral headlines');
  }
  return { score, details: details.join('; ') };
}

export async function generateFisherOutput(
  ticker: string,
  analysisData: any,
  apiKey: string
): Promise<PhilFisherSignal> {
  // 构造 LLM prompt
  const systemPrompt = `You are a Phil Fisher AI agent, making investment decisions using his principles:
1. Emphasize long-term growth potential and quality of management.
2. Focus on companies investing in R&D for future products/services.
3. Look for strong profitability and consistent margins.
4. Willing to pay more for exceptional companies but still mindful of valuation.
5. Rely on thorough research (scuttlebutt) and thorough fundamental checks.

When providing your reasoning, be thorough and specific by:
1. Discussing the company's growth prospects in detail with specific metrics and trends
2. Evaluating management quality and their capital allocation decisions
3. Highlighting R&D investments and product pipeline that could drive future growth
4. Assessing consistency of margins and profitability metrics with precise numbers
5. Explaining competitive advantages that could sustain growth over 3-5+ years
6. Using Phil Fisher's methodical, growth-focused, and long-term oriented voice

For example, if bullish: "This company exhibits the sustained growth characteristics we seek, with revenue increasing at 18% annually over five years. Management has demonstrated exceptional foresight by allocating 15% of revenue to R&D, which has produced three promising new product lines. The consistent operating margins of 22-24% indicate pricing power and operational efficiency that should continue to..."

For example, if bearish: "Despite operating in a growing industry, management has failed to translate R&D investments (only 5% of revenue) into meaningful new products. Margins have fluctuated between 10-15%, showing inconsistent operational execution. The company faces increasing competition from three larger competitors with superior distribution networks. Given these concerns about long-term growth sustainability..."

You must output a JSON object with:
  - "signal": "bullish" or "bearish" or "neutral"
  - "confidence": a float between 0 and 100
  - "reasoning": a detailed explanation
`;
  const userPrompt = `Based on the following analysis, create a Phil Fisher-style investment signal.\n\nAnalysis Data for ${ticker}:\n${JSON.stringify(analysisData, null, 2)}\n\nReturn the trading signal in this JSON format:\n{\n  "signal": "bullish/bearish/neutral",\n  "confidence": float (0-100),\n  "reasoning": "string"\n}`;

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
  console.log('[Phil Fisher] OpenAI 原始返回内容:', content);
  // 提取 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const cleanJson = jsonMatch[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    try {
      const result = JSON.parse(cleanJson) as PhilFisherSignal;
      console.log('[Fisher] OpenAI response:', result);
      return result;
    } catch (parseError) {
      console.error('Fisher JSON parse error:', parseError, '\n原始内容:', cleanJson);
      throw parseError;
    }
  }
  throw new Error('Unable to extract JSON from response');
} 