import { OpenAI } from 'openai';
import { StockData } from '@/types';

export type CharlieMungerSignal = {
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  reasoning: string;
};

// --- 分析模块 ---

function analyzeMoatStrength(metrics: any[], financialLineItems: any[]): { score: number; details: string } {
  let score = 0;
  const details: string[] = [];
  if (!metrics || !financialLineItems) {
    return { score: 0, details: 'Insufficient data to analyze moat strength' };
  }
  // 1. ROIC
  const roicValues = financialLineItems.map(item => item.return_on_invested_capital).filter((v: any): v is number => typeof v === 'number');
  if (roicValues.length) {
    const highRoicCount = roicValues.filter((r: number) => r > 0.15).length;
    if (highRoicCount >= roicValues.length * 0.8) {
      score += 3;
      details.push(`Excellent ROIC: >15% in ${highRoicCount}/${roicValues.length} periods`);
    } else if (highRoicCount >= roicValues.length * 0.5) {
      score += 2;
      details.push(`Good ROIC: >15% in ${highRoicCount}/${roicValues.length} periods`);
    } else if (highRoicCount > 0) {
      score += 1;
      details.push(`Mixed ROIC: >15% in only ${highRoicCount}/${roicValues.length} periods`);
    } else {
      details.push('Poor ROIC: Never exceeds 15% threshold');
    }
  } else {
    details.push('No ROIC data available');
  }
  // 2. Gross margin
  const grossMargins = financialLineItems.map(item => item.gross_margin).filter((m: any): m is number => typeof m === 'number');
  if (grossMargins.length >= 3) {
    const marginTrend = grossMargins.slice(1).filter((m, i) => m >= grossMargins[i]).length;
    if (marginTrend >= grossMargins.length * 0.7) {
      score += 2;
      details.push('Strong pricing power: Gross margins consistently improving');
    } else if (grossMargins.reduce((a, b) => a + b, 0) / grossMargins.length > 0.3) {
      score += 1;
      details.push(`Good pricing power: Average gross margin ${(grossMargins.reduce((a, b) => a + b, 0) / grossMargins.length * 100).toFixed(1)}%`);
    } else {
      details.push('Limited pricing power: Low or declining gross margins');
    }
  } else {
    details.push('Insufficient gross margin data');
  }
  // 3. Capital intensity
  if (financialLineItems.length >= 3) {
    const capexToRevenue = financialLineItems.map(item => {
      if (item.capital_expenditure !== undefined && item.revenue !== undefined && item.revenue > 0) {
        return Math.abs(item.capital_expenditure) / item.revenue;
      }
      return null;
    }).filter((v: any): v is number => typeof v === 'number');
    if (capexToRevenue.length) {
      const avgCapexRatio = capexToRevenue.reduce((a: number, b: number) => a + b, 0) / capexToRevenue.length;
      if (avgCapexRatio < 0.05) {
        score += 2;
        details.push(`Low capital requirements: Avg capex ${(avgCapexRatio * 100).toFixed(1)}% of revenue`);
      } else if (avgCapexRatio < 0.10) {
        score += 1;
        details.push(`Moderate capital requirements: Avg capex ${(avgCapexRatio * 100).toFixed(1)}% of revenue`);
      } else {
        details.push(`High capital requirements: Avg capex ${(avgCapexRatio * 100).toFixed(1)}% of revenue`);
      }
    } else {
      details.push('No capital expenditure data available');
    }
  } else {
    details.push('Insufficient data for capital intensity analysis');
  }
  // 4. Intangible assets
  const rAndD = financialLineItems.map(item => item.research_and_development).filter((v: any): v is number => typeof v === 'number');
  const goodwill = financialLineItems.map(item => item.goodwill_and_intangible_assets).filter((v: any): v is number => typeof v === 'number');
  if (rAndD.length && rAndD.reduce((a: number, b: number) => a + b, 0) > 0) {
    score += 1;
    details.push('Invests in R&D, building intellectual property');
  }
  if (goodwill.length && goodwill.reduce((a: number, b: number) => a + b, 0) > 0) {
    score += 1;
    details.push('Significant goodwill/intangible assets, suggesting brand value or IP');
  }
  // Scale score to 0-10
  const finalScore = Math.min(10, score * 10 / 9);
  return { score: finalScore, details: details.join('; ') };
}

function analyzeManagementQuality(financialLineItems: any[], insiderTrades: any[]): { score: number; details: string } {
  let score = 0;
  const details: string[] = [];
  if (!financialLineItems) {
    return { score: 0, details: 'Insufficient data to analyze management quality' };
  }
  // 1. FCF to Net Income
  const fcfValues = financialLineItems.map(item => item.free_cash_flow).filter((v: any): v is number => typeof v === 'number');
  const netIncomeValues = financialLineItems.map(item => item.net_income).filter((v: any): v is number => typeof v === 'number');
  if (fcfValues.length && netIncomeValues.length && fcfValues.length === netIncomeValues.length) {
    const fcfToNiRatios = fcfValues.map((fcf: number, i: number) => netIncomeValues[i] > 0 ? fcf / netIncomeValues[i] : null).filter((v: any): v is number => typeof v === 'number');
    if (fcfToNiRatios.length) {
      const avgRatio = fcfToNiRatios.reduce((a: number, b: number) => a + b, 0) / fcfToNiRatios.length;
      if (avgRatio > 1.1) {
        score += 3;
        details.push(`Excellent cash conversion: FCF/NI ratio of ${avgRatio.toFixed(2)}`);
      } else if (avgRatio > 0.9) {
        score += 2;
        details.push(`Good cash conversion: FCF/NI ratio of ${avgRatio.toFixed(2)}`);
      } else if (avgRatio > 0.7) {
        score += 1;
        details.push(`Moderate cash conversion: FCF/NI ratio of ${avgRatio.toFixed(2)}`);
      } else {
        details.push(`Poor cash conversion: FCF/NI ratio of only ${avgRatio.toFixed(2)}`);
      }
    } else {
      details.push('Could not calculate FCF to Net Income ratios');
    }
  } else {
    details.push('Missing FCF or Net Income data');
  }
  // 2. Debt management
  const debtValues = financialLineItems.map(item => item.total_debt).filter((v: any): v is number => typeof v === 'number');
  const equityValues = financialLineItems.map(item => item.shareholders_equity).filter((v: any): v is number => typeof v === 'number');
  if (debtValues.length && equityValues.length && debtValues.length === equityValues.length) {
    const recentDeRatio = equityValues[0] > 0 ? debtValues[0] / equityValues[0] : Infinity;
    if (recentDeRatio < 0.3) {
      score += 3;
      details.push(`Conservative debt management: D/E ratio of ${recentDeRatio.toFixed(2)}`);
    } else if (recentDeRatio < 0.7) {
      score += 2;
      details.push(`Prudent debt management: D/E ratio of ${recentDeRatio.toFixed(2)}`);
    } else if (recentDeRatio < 1.5) {
      score += 1;
      details.push(`Moderate debt level: D/E ratio of ${recentDeRatio.toFixed(2)}`);
    } else {
      details.push(`High debt level: D/E ratio of ${recentDeRatio.toFixed(2)}`);
    }
  } else {
    details.push('Missing debt or equity data');
  }
  // 3. Cash management
  const cashValues = financialLineItems.map(item => item.cash_and_equivalents).filter((v: any): v is number => typeof v === 'number');
  const revenueValues = financialLineItems.map(item => item.revenue).filter((v: any): v is number => typeof v === 'number');
  if (cashValues.length && revenueValues.length) {
    const cashToRevenue = revenueValues[0] > 0 ? cashValues[0] / revenueValues[0] : 0;
    if (cashToRevenue >= 0.1 && cashToRevenue <= 0.25) {
      score += 2;
      details.push(`Prudent cash management: Cash/Revenue ratio of ${cashToRevenue.toFixed(2)}`);
    } else if ((cashToRevenue >= 0.05 && cashToRevenue < 0.1) || (cashToRevenue > 0.25 && cashToRevenue <= 0.4)) {
      score += 1;
      details.push(`Acceptable cash position: Cash/Revenue ratio of ${cashToRevenue.toFixed(2)}`);
    } else if (cashToRevenue > 0.4) {
      details.push(`Excess cash reserves: Cash/Revenue ratio of ${cashToRevenue.toFixed(2)}`);
    } else {
      details.push(`Low cash reserves: Cash/Revenue ratio of ${cashToRevenue.toFixed(2)}`);
    }
  } else {
    details.push('Insufficient cash or revenue data');
  }
  // 4. Insider activity
  if (insiderTrades && insiderTrades.length > 0) {
    const buys = insiderTrades.filter((trade: any) => trade.transaction_type && ['buy', 'purchase'].includes(trade.transaction_type.toLowerCase())).length;
    const sells = insiderTrades.filter((trade: any) => trade.transaction_type && ['sell', 'sale'].includes(trade.transaction_type.toLowerCase())).length;
    const totalTrades = buys + sells;
    if (totalTrades > 0) {
      const buyRatio = buys / totalTrades;
      if (buyRatio > 0.7) {
        score += 2;
        details.push(`Strong insider buying: ${buys}/${totalTrades} transactions are purchases`);
      } else if (buyRatio > 0.4) {
        score += 1;
        details.push(`Balanced insider trading: ${buys}/${totalTrades} transactions are purchases`);
      } else if (buyRatio < 0.1 && sells > 5) {
        score -= 1;
        details.push(`Concerning insider selling: ${sells}/${totalTrades} transactions are sales`);
      } else {
        details.push(`Mixed insider activity: ${buys}/${totalTrades} transactions are purchases`);
      }
    } else {
      details.push('No recorded insider transactions');
    }
  } else {
    details.push('No insider trading data available');
  }
  // 5. Share count
  const shareCounts = financialLineItems.map(item => item.outstanding_shares).filter((v: any): v is number => typeof v === 'number');
  if (shareCounts.length >= 3) {
    if (shareCounts[0] < shareCounts[shareCounts.length - 1] * 0.95) {
      score += 2;
      details.push('Shareholder-friendly: Reducing share count over time');
    } else if (shareCounts[0] < shareCounts[shareCounts.length - 1] * 1.05) {
      score += 1;
      details.push('Stable share count: Limited dilution');
    } else if (shareCounts[0] > shareCounts[shareCounts.length - 1] * 1.2) {
      score -= 1;
      details.push('Concerning dilution: Share count increased significantly');
    } else {
      details.push('Moderate share count increase over time');
    }
  } else {
    details.push('Insufficient share count data');
  }
  // Scale score to 0-10
  const finalScore = Math.max(0, Math.min(10, score * 10 / 12));
  return { score: finalScore, details: details.join('; ') };
}

function analyzePredictability(financialLineItems: any[]): { score: number; details: string } {
  let score = 0;
  const details: string[] = [];
  if (!financialLineItems || financialLineItems.length < 5) {
    return { score: 0, details: 'Insufficient data to analyze business predictability (need 5+ years)' };
  }
  // 1. Revenue
  const revenues = financialLineItems.map(item => item.revenue).filter((v: any): v is number => typeof v === 'number');
  if (revenues.length >= 5) {
    const growthRates = revenues.slice(0, -1).map((v: number, i: number) => revenues[i] / revenues[i + 1] - 1);
    const avgGrowth = growthRates.reduce((a: number, b: number) => a + b, 0) / growthRates.length;
    const growthVolatility = growthRates.reduce((a: number, b: number) => a + Math.abs(b - avgGrowth), 0) / growthRates.length;
    if (avgGrowth > 0.05 && growthVolatility < 0.1) {
      score += 3;
      details.push(`Highly predictable revenue: ${(avgGrowth * 100).toFixed(1)}% avg growth with low volatility`);
    } else if (avgGrowth > 0 && growthVolatility < 0.2) {
      score += 2;
      details.push(`Moderately predictable revenue: ${(avgGrowth * 100).toFixed(1)}% avg growth with some volatility`);
    } else if (avgGrowth > 0) {
      score += 1;
      details.push(`Growing but less predictable revenue: ${(avgGrowth * 100).toFixed(1)}% avg growth with high volatility`);
    } else {
      details.push(`Declining or highly unpredictable revenue: ${(avgGrowth * 100).toFixed(1)}% avg growth`);
    }
  } else {
    details.push('Insufficient revenue history for predictability analysis');
  }
  // 2. Operating income
  const opIncome = financialLineItems.map(item => item.operating_income).filter((v: any): v is number => typeof v === 'number');
  if (opIncome.length >= 5) {
    const positivePeriods = opIncome.filter((v: number) => v > 0).length;
    if (positivePeriods === opIncome.length) {
      score += 3;
      details.push('Highly predictable operations: Operating income positive in all periods');
    } else if (positivePeriods >= opIncome.length * 0.8) {
      score += 2;
      details.push(`Predictable operations: Operating income positive in ${positivePeriods}/${opIncome.length} periods`);
    } else if (positivePeriods >= opIncome.length * 0.6) {
      score += 1;
      details.push(`Somewhat predictable operations: Operating income positive in ${positivePeriods}/${opIncome.length} periods`);
    } else {
      details.push(`Unpredictable operations: Operating income positive in only ${positivePeriods}/${opIncome.length} periods`);
    }
  } else {
    details.push('Insufficient operating income history');
  }
  // 3. Margin consistency
  const opMargins = financialLineItems.map(item => item.operating_margin).filter((v: any): v is number => typeof v === 'number');
  if (opMargins.length >= 5) {
    const avgMargin = opMargins.reduce((a: number, b: number) => a + b, 0) / opMargins.length;
    const marginVolatility = opMargins.reduce((a: number, b: number) => a + Math.abs(b - avgMargin), 0) / opMargins.length;
    if (marginVolatility < 0.03) {
      score += 2;
      details.push(`Highly predictable margins: ${(avgMargin * 100).toFixed(1)}% avg with minimal volatility`);
    } else if (marginVolatility < 0.07) {
      score += 1;
      details.push(`Moderately predictable margins: ${(avgMargin * 100).toFixed(1)}% avg with some volatility`);
    } else {
      details.push(`Unpredictable margins: ${(avgMargin * 100).toFixed(1)}% avg with high volatility (${(marginVolatility * 100).toFixed(1)}%)`);
    }
  } else {
    details.push('Insufficient margin history');
  }
  // 4. Cash generation
  const fcfValues = financialLineItems.map(item => item.free_cash_flow).filter((v: any): v is number => typeof v === 'number');
  if (fcfValues.length >= 5) {
    const positiveFcfPeriods = fcfValues.filter((v: number) => v > 0).length;
    if (positiveFcfPeriods === fcfValues.length) {
      score += 2;
      details.push('Highly predictable cash generation: Positive FCF in all periods');
    } else if (positiveFcfPeriods >= fcfValues.length * 0.8) {
      score += 1;
      details.push(`Predictable cash generation: Positive FCF in ${positiveFcfPeriods}/${fcfValues.length} periods`);
    } else {
      details.push(`Unpredictable cash generation: Positive FCF in only ${positiveFcfPeriods}/${fcfValues.length} periods`);
    }
  } else {
    details.push('Insufficient free cash flow history');
  }
  // Scale score to 0-10
  const finalScore = Math.min(10, score * 10 / 10);
  return { score: finalScore, details: details.join('; ') };
}

function calculateMungerValuation(financialLineItems: any[], marketCap: number): { score: number; details: string; intrinsicValueRange?: any; fcfYield?: number; normalizedFcf?: number } {
  let score = 0;
  const details: string[] = [];
  if (!financialLineItems || marketCap == null) {
    return { score: 0, details: 'Insufficient data to perform valuation' };
  }
  const fcfValues = financialLineItems.map(item => item.free_cash_flow).filter((v: any): v is number => typeof v === 'number');
  if (!fcfValues.length || fcfValues.length < 3) {
    return { score: 0, details: 'Insufficient free cash flow data for valuation' };
  }
  const normalizedFcf = fcfValues.slice(0, 5).reduce((a: number, b: number) => a + b, 0) / Math.min(5, fcfValues.length);
  if (normalizedFcf <= 0) {
    return { score: 0, details: `Negative or zero normalized FCF (${normalizedFcf}), cannot value`, intrinsicValueRange: null };
  }
  const fcfYield = normalizedFcf / marketCap;
  if (fcfYield > 0.08) {
    score += 4;
    details.push(`Excellent value: ${(fcfYield * 100).toFixed(1)}% FCF yield`);
  } else if (fcfYield > 0.05) {
    score += 3;
    details.push(`Good value: ${(fcfYield * 100).toFixed(1)}% FCF yield`);
  } else if (fcfYield > 0.03) {
    score += 1;
    details.push(`Fair value: ${(fcfYield * 100).toFixed(1)}% FCF yield`);
  } else {
    details.push(`Expensive: Only ${(fcfYield * 100).toFixed(1)}% FCF yield`);
  }
  const conservativeValue = normalizedFcf * 10;
  const reasonableValue = normalizedFcf * 15;
  const optimisticValue = normalizedFcf * 20;
  const currentToReasonable = (reasonableValue - marketCap) / marketCap;
  if (currentToReasonable > 0.3) {
    score += 3;
    details.push(`Large margin of safety: ${(currentToReasonable * 100).toFixed(1)}% upside to reasonable value`);
  } else if (currentToReasonable > 0.1) {
    score += 2;
    details.push(`Moderate margin of safety: ${(currentToReasonable * 100).toFixed(1)}% upside to reasonable value`);
  } else if (currentToReasonable > -0.1) {
    score += 1;
    details.push(`Fair price: Within 10% of reasonable value (${(currentToReasonable * 100).toFixed(1)}%)`);
  } else {
    details.push(`Expensive: ${(-currentToReasonable * 100).toFixed(1)}% premium to reasonable value`);
  }
  if (fcfValues.length >= 3) {
    const recentAvg = fcfValues.slice(0, 3).reduce((a: number, b: number) => a + b, 0) / 3;
    const olderAvg = fcfValues.length >= 6 ? fcfValues.slice(-3).reduce((a: number, b: number) => a + b, 0) / 3 : fcfValues[fcfValues.length - 1];
    if (recentAvg > olderAvg * 1.2) {
      score += 3;
      details.push('Growing FCF trend adds to intrinsic value');
    } else if (recentAvg > olderAvg) {
      score += 2;
      details.push('Stable to growing FCF supports valuation');
    } else {
      details.push('Declining FCF trend is concerning');
    }
  }
  const finalScore = Math.min(10, score * 10 / 10);
  return {
    score: finalScore,
    details: details.join('; '),
    intrinsicValueRange: {
      conservative: conservativeValue,
      reasonable: reasonableValue,
      optimistic: optimisticValue
    },
    fcfYield,
    normalizedFcf
  };
}

function analyzeNewsSentiment(newsItems: any[]): string {
  if (!newsItems || newsItems.length === 0) {
    return 'No news data available';
  }
  return `Qualitative review of ${newsItems.length} recent news items would be needed`;
}

export async function generateMungerOutput(
  ticker: string,
  analysisData: any,
  apiKey: string
): Promise<CharlieMungerSignal> {
  // 构造 LLM prompt
  const systemPrompt = `You are a Charlie Munger AI agent, making investment decisions using his principles:

1. Focus on the quality and predictability of the business.
2. Rely on mental models from multiple disciplines to analyze investments.
3. Look for strong, durable competitive advantages (moats).
4. Emphasize long-term thinking and patience.
5. Value management integrity and competence.
6. Prioritize businesses with high returns on invested capital.
7. Pay a fair price for wonderful businesses.
8. Never overpay, always demand a margin of safety.
9. Avoid complexity and businesses you don't understand.
10. "Invert, always invert" - focus on avoiding stupidity rather than seeking brilliance.

Rules:
- Praise businesses with predictable, consistent operations and cash flows.
- Value businesses with high ROIC and pricing power.
- Prefer simple businesses with understandable economics.
- Admire management with skin in the game and shareholder-friendly capital allocation.
- Focus on long-term economics rather than short-term metrics.
- Be skeptical of businesses with rapidly changing dynamics or excessive share dilution.
- Avoid excessive leverage or financial engineering.
- Provide a rational, data-driven recommendation (bullish, bearish, or neutral).

When providing your reasoning, be thorough and specific by:
1. Explaining the key factors that influenced your decision the most (both positive and negative)
2. Applying at least 2-3 specific mental models or disciplines to explain your thinking
3. Providing quantitative evidence where relevant (e.g., specific ROIC values, margin trends)
4. Citing what you would "avoid" in your analysis (invert the problem)
5. Using Charlie Munger's direct, pithy conversational style in your explanation

For example, if bullish: "The high ROIC of 22% demonstrates the company's moat. When applying basic microeconomics, we can see that competitors would struggle to..."
For example, if bearish: "I see this business making a classic mistake in capital allocation. As I've often said about [relevant Mungerism], this company appears to be..."
`;
  const userPrompt = `Based on the following analysis, create a Munger-style investment signal.\n\nAnalysis Data for ${ticker}:\n${JSON.stringify(analysisData, null, 2)}\n\nReturn the trading signal in this JSON format:\n{\n  "signal": "bullish/bearish/neutral",\n  "confidence": float (0-100),\n  "reasoning": "string"\n}`;

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
      const result = JSON.parse(cleanJson) as CharlieMungerSignal;
      console.log('[Munger] OpenAI response:', result);
      return result;
    } catch (parseError) {
      console.error('Munger JSON parse error:', parseError, '\n原始内容:', cleanJson);
      throw parseError;
    }
  }
  throw new Error('Unable to extract JSON from response');
} 