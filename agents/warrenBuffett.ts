import { OpenAI } from 'openai';
import { StockData } from '@/types';

/**
 * Warren Buffett策略 - 价值投资者
 * 关注有竞争优势、管理良好、长期商业模式的公司
 */

// Signal type for Buffett agent
export type Signal = 'bullish' | 'bearish' | 'neutral';

export interface WarrenBuffettSignal {
  signal: Signal;
  confidence: number; // 0-100
  reasoning: string;
}

export interface FinancialMetrics {
  returnOnEquity?: number; // ROE
  debtToEquity?: number;
  operatingMargin?: number;
  currentRatio?: number;
}

export interface FinancialLineItem {
  netIncome?: number;
  depreciationAndAmortization?: number;
  capitalExpenditure?: number;
  outstandingShares?: number;
  dividendsAndOtherCashDistributions?: number;
  issuanceOrPurchaseOfEquityShares?: number;
}

export interface IntrinsicValueResult {
  intrinsicValue: number | null;
  ownerEarnings: number | null;
  details: string[];
}

// Analyze fundamentals for Buffett agent
function analyzeFundamentals(metrics: FinancialMetrics[]): { score: number; details: string[] } {
  if (!metrics.length) return { score: 0, details: ['No financial metrics provided'] };
  const latest = metrics[0];
  let score = 0;
  const details: string[] = [];

  if (latest.returnOnEquity !== undefined) {
    if (latest.returnOnEquity > 0.15) {
      score += 2;
      details.push(`Strong ROE: ${(latest.returnOnEquity * 100).toFixed(1)}%`);
    } else {
      details.push(`Weak ROE: ${(latest.returnOnEquity * 100).toFixed(1)}%`);
    }
  } else details.push('ROE missing');

  if (latest.debtToEquity !== undefined) {
    if (latest.debtToEquity < 0.5) {
      score += 2;
      details.push(`Low Debt/Equity: ${latest.debtToEquity.toFixed(2)}`);
    } else {
      details.push(`High Debt/Equity: ${latest.debtToEquity.toFixed(2)}`);
    }
  } else details.push('Debt/Equity missing');

  if (latest.operatingMargin !== undefined) {
    if (latest.operatingMargin > 0.15) {
      score += 2;
      details.push(`Strong Operating Margin: ${(latest.operatingMargin * 100).toFixed(1)}%`);
    } else {
      details.push(`Weak Operating Margin: ${(latest.operatingMargin * 100).toFixed(1)}%`);
    }
  } else details.push('Operating Margin missing');

  if (latest.currentRatio !== undefined) {
    if (latest.currentRatio > 1.5) {
      score += 1;
      details.push(`Good liquidity: Current Ratio ${latest.currentRatio.toFixed(2)}`);
    } else {
      details.push(`Weak liquidity: Current Ratio ${latest.currentRatio.toFixed(2)}`);
    }
  } else details.push('Current Ratio missing');

  return { score, details };
}

// Calculate Owner Earnings
function calculateOwnerEarnings(financialLineItems: any[]): { ownerEarnings: number | null; details: string[] } {
  if (!financialLineItems || financialLineItems.length === 0) return { ownerEarnings: null, details: ['Insufficient data for owner earnings calculation'] };
  const latest = financialLineItems[0];
  const netIncome = latest.netIncome;
  const depreciation = latest.depreciationAndAmortization;
  const capex = latest.capitalExpenditure;
  if (netIncome == null || depreciation == null || capex == null) {
    return { ownerEarnings: null, details: ['Missing components for owner earnings calculation'] };
  }
  const maintenanceCapex = capex * 0.75;
  const ownerEarnings = netIncome + depreciation - maintenanceCapex;
  return { ownerEarnings, details: ['Owner earnings calculated successfully'] };
}

// Calculate Intrinsic Value using DCF (Owner Earnings)
function calculateIntrinsicValue(financialLineItems: any[]): { intrinsicValue: number | null; details: string[] } {
  if (!financialLineItems || financialLineItems.length === 0) return { intrinsicValue: null, details: ['Insufficient data for valuation'] };
  const earningsData = calculateOwnerEarnings(financialLineItems);
  if (earningsData.ownerEarnings == null) return { intrinsicValue: null, details: earningsData.details };
  const ownerEarnings = earningsData.ownerEarnings;
  const latest = financialLineItems[0];
  const sharesOutstanding = latest.outstandingShares;
  if (!sharesOutstanding) return { intrinsicValue: null, details: ['Missing shares outstanding data'] };
  const growthRate = 0.05;
  const discountRate = 0.09;
  const terminalMultiple = 12;
  const projectionYears = 10;
  let futureValue = 0;
  for (let year = 1; year <= projectionYears; year++) {
    const futureEarnings = ownerEarnings * Math.pow(1 + growthRate, year);
    const presentValue = futureEarnings / Math.pow(1 + discountRate, year);
    futureValue += presentValue;
  }
  const terminalValue = (ownerEarnings * Math.pow(1 + growthRate, projectionYears) * terminalMultiple) / Math.pow(1 + discountRate, projectionYears);
  const intrinsicValue = futureValue + terminalValue;
  return { intrinsicValue, details: ['Intrinsic value calculated using DCF model with owner earnings'] };
}

// Generate Buffett signal
function generateSignal(
  totalScore: number,
  maxScore: number,
  marginOfSafety: number | null
): WarrenBuffettSignal {
  let signal: Signal = 'neutral';
  let confidence = 50;
  let reasoning = '';
  if (totalScore >= 0.7 * maxScore && marginOfSafety !== null && marginOfSafety >= 0.3) {
    signal = 'bullish';
    confidence = 90;
    reasoning = 'Strong fundamentals, good moat, and sufficient margin of safety (>30%)';
  } else if (totalScore <= 0.3 * maxScore || (marginOfSafety !== null && marginOfSafety < -0.3)) {
    signal = 'bearish';
    confidence = 85;
    reasoning = 'Weak fundamentals or negative margin of safety below -30%';
  } else {
    signal = 'neutral';
    confidence = 60;
    reasoning = 'Mixed signals; neither strong buy nor clear sell';
  }
  return { signal, confidence, reasoning };
}

// --- 业绩一致性分析 ---
function analyzeConsistency(financialLineItems: any[]): { score: number; details: string } {
  if (!financialLineItems || financialLineItems.length < 4) return { score: 0, details: 'Insufficient historical data' };
  let score = 0;
  const reasoning: string[] = [];
  const earnings = financialLineItems.map((item: any) => item.netIncome).filter((v: any) => v != null);
  if (earnings.length >= 4) {
    const growth = earnings.every((v: number, i: number, arr: number[]) => i === 0 || v >= arr[i - 1]);
    if (growth) {
      score += 3;
      reasoning.push('Consistent earnings growth over past periods');
    } else {
      reasoning.push('Inconsistent earnings growth pattern');
    }
    if (earnings.length >= 2 && earnings[earnings.length - 1] !== 0) {
      const growthRate = (earnings[0] - earnings[earnings.length - 1]) / Math.abs(earnings[earnings.length - 1]);
      reasoning.push(`Total earnings growth of ${(growthRate * 100).toFixed(1)}% over past ${earnings.length} periods`);
    }
  } else {
    reasoning.push('Insufficient earnings data for trend analysis');
  }
  return { score, details: reasoning.join('; ') };
}

// --- 护城河分析 ---
function analyzeMoat(metrics: any[]): { score: number; maxScore: number; details: string } {
  if (!metrics || metrics.length < 3) return { score: 0, maxScore: 3, details: 'Insufficient data for moat analysis' };
  let moatScore = 0;
  const reasoning: string[] = [];
  const roes = metrics.map((m: any) => m.returnOnEquity).filter((v: any) => v != null);
  const margins = metrics.map((m: any) => m.operatingMargin).filter((v: any) => v != null);
  if (roes.length >= 3) {
    const stableROE = roes.every((r: number) => r > 0.15);
    if (stableROE) {
      moatScore += 1;
      reasoning.push('Stable ROE above 15% across periods (suggests moat)');
    } else {
      reasoning.push('ROE not consistently above 15%');
    }
  }
  if (margins.length >= 3) {
    const stableMargin = margins.every((m: number) => m > 0.15);
    if (stableMargin) {
      moatScore += 1;
      reasoning.push('Stable operating margins above 15% (moat indicator)');
    } else {
      reasoning.push('Operating margin not consistently above 15%');
    }
  }
  if (moatScore === 2) {
    moatScore += 1;
    reasoning.push('Both ROE and margin stability indicate a solid moat');
  }
  return { score: moatScore, maxScore: 3, details: reasoning.join('; ') };
}

// --- 管理层分析 ---
function analyzeManagementQuality(financialLineItems: any[]): { score: number; maxScore: number; details: string } {
  if (!financialLineItems || financialLineItems.length === 0) return { score: 0, maxScore: 2, details: 'Insufficient data for management analysis' };
  let mgmtScore = 0;
  const reasoning: string[] = [];
  const latest = financialLineItems[0];
  if (latest.issuanceOrPurchaseOfEquityShares && latest.issuanceOrPurchaseOfEquityShares < 0) {
    mgmtScore += 1;
    reasoning.push('Company has been repurchasing shares (shareholder-friendly)');
  }
  if (latest.issuanceOrPurchaseOfEquityShares && latest.issuanceOrPurchaseOfEquityShares > 0) {
    reasoning.push('Recent common stock issuance (potential dilution)');
  } else {
    reasoning.push('No significant new stock issuance detected');
  }
  if (latest.dividendsAndOtherCashDistributions && latest.dividendsAndOtherCashDistributions < 0) {
    mgmtScore += 1;
    reasoning.push('Company has a track record of paying dividends');
  } else {
    reasoning.push('No or minimal dividends paid');
  }
  return { score: mgmtScore, maxScore: 2, details: reasoning.join('; ') };
}

// Main Buffett strategy function
export async function buffettAgent(stockData: StockData, openaiApiKey: string): Promise<WarrenBuffettSignal> {
  console.log('[Buffett] buffettAgent 入口，收到 stockData:', stockData);
  // 1. 构建本地分析数据
  const stats: any = stockData.quoteSummary?.defaultKeyStatistics || {};
  const metrics = [
    {
      returnOnEquity: stats.returnOnEquity?.raw,
      debtToEquity: stats.debtToEquity?.raw,
      operatingMargin: stats.profitMargins?.raw,
      currentRatio: stockData.currentRatio,
    },
    // 可扩展为多期
  ] as any[];
  const financialLineItems = [
    {
      netIncome: stats.netIncomeToCommon?.raw,
      depreciationAndAmortization: stats.depreciationAndAmortization?.raw,
      capitalExpenditure: stats.capitalExpenditure?.raw,
      outstandingShares: stockData.sharesOutstanding,
      dividendsAndOtherCashDistributions: stats.dividendsAndOtherCashDistributions?.raw,
      issuanceOrPurchaseOfEquityShares: stats.issuanceOrPurchaseOfEquityShares?.raw,
    },
    // 可扩展为多期
  ] as any[];
  const fundamental = analyzeFundamentals(metrics);
  const consistency = analyzeConsistency(financialLineItems);
  const moat = analyzeMoat(metrics);
  const mgmt = analyzeManagementQuality(financialLineItems);
  const intrinsic = calculateIntrinsicValue(financialLineItems);
  // 计算 margin of safety
  let marginOfSafety: number | null = null;
  const intrinsicValue = intrinsic.intrinsicValue;
  const marketCap = stockData.marketCap;
  if (intrinsicValue && marketCap) {
    marginOfSafety = (intrinsicValue - marketCap) / marketCap;
  }
  // 汇总 analysisData
  const analysisData = {
    signal: 'neutral', // 仅供 LLM 参考
    score: fundamental.score + consistency.score + moat.score + mgmt.score,
    max_score: 10 + moat.maxScore + mgmt.maxScore,
    fundamental_analysis: fundamental,
    consistency_analysis: consistency,
    moat_analysis: moat,
    management_analysis: mgmt,
    intrinsic_value_analysis: intrinsic,
    market_cap: marketCap,
    margin_of_safety: marginOfSafety,
  };
  // 2. 调用 LLM
  const result = await generateBuffettOutput(stockData.symbol, analysisData, openaiApiKey);
  console.log('[Buffett] buffettAgent 出口，最终结果:', result);
  return result;
}

// --- LLM Prompt 及主流程 ---

export async function generateBuffettOutput(
  ticker: string,
  analysisData: any,
  apiKey: string
): Promise<WarrenBuffettSignal> {
  const openai = new OpenAI({ apiKey });
  const systemPrompt = `You are a Warren Buffett AI agent. Decide on investment signals based on Warren Buffett's principles:\n- Circle of Competence: Only invest in businesses you understand\n- Margin of Safety (> 30%): Buy at a significant discount to intrinsic value\n- Economic Moat: Look for durable competitive advantages\n- Quality Management: Seek conservative, shareholder-oriented teams\n- Financial Strength: Favor low debt, strong returns on equity\n- Long-term Horizon: Invest in businesses, not just stocks\n- Sell only if fundamentals deteriorate or valuation far exceeds intrinsic value\n\nWhen providing your reasoning, be thorough and specific by:\n1. Explaining the key factors that influenced your decision the most (both positive and negative)\n2. Highlighting how the company aligns with or violates specific Buffett principles\n3. Providing quantitative evidence where relevant (e.g., specific margins, ROE values, debt levels)\n4. Concluding with a Buffett-style assessment of the investment opportunity\n5. Using Warren Buffett's voice and conversational style in your explanation\n\nFor example, if bullish: "I'm particularly impressed with [specific strength], reminiscent of our early investment in See's Candies where we saw [similar attribute]..."\nFor example, if bearish: "The declining returns on capital remind me of the textile operations at Berkshire that we eventually exited because..."\n\nFollow these guidelines strictly.`;
  const userPrompt = `Based on the following data, create the investment signal as Warren Buffett would:\n\nAnalysis Data for ${ticker}:\n${JSON.stringify(analysisData, null, 2)}\n\nReturn the trading signal in the following JSON format exactly:\n{\n  "signal": "bullish" | "bearish" | "neutral",\n  "confidence": float between 0 and 100,\n  "reasoning": "string"\n}`;
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
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const cleanJson = jsonMatch[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      try {
        const result = JSON.parse(cleanJson) as WarrenBuffettSignal;
        return result;
      } catch (parseError) {
        console.error('Buffett JSON parse error:', parseError, '\n原始内容:', cleanJson);
        throw parseError;
      }
    }
    throw new Error('Unable to extract JSON from response');
  } catch (error) {
    console.error('Error executing Buffett strategy:', error);
    return {
      signal: 'neutral',
      confidence: 0,
      reasoning: 'Error in analysis, defaulting to neutral'
    };
  }
} 