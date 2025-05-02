import { StockData } from '@/types';
import { OpenAI } from 'openai';
// Signal type for Ackman agent
export type Signal = 'bullish' | 'bearish' | 'neutral';

export interface BillAckmanSignal {
  signal: Signal;
  confidence: number; // 0-100
  reasoning: string;
}

export interface FinancialLineItem {
  revenue?: number;
  operatingMargin?: number;
  debtToEquity?: number;
  freeCashFlow?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  dividendsAndOtherCashDistributions?: number;
  outstandingShares?: number;
  returnOnEquity?: number;
  // Optionally: intangibleAssets?: number;
}

export interface AnalysisResult {
  score: number;
  details: string;
  [key: string]: any;
}

// Analyze business quality: revenue growth, margin, FCF, ROE, brand
function analyzeBusinessQuality(metrics: FinancialLineItem[], latest: FinancialLineItem): AnalysisResult {
  let score = 0;
  const details: string[] = [];

  // 1. Multi-period revenue growth
  const revenues = metrics.map(item => item.revenue).filter(r => r !== undefined) as number[];
  if (revenues.length >= 2) {
    const initial = revenues[revenues.length - 1];
    const final = revenues[0];
    if (initial && final && final > initial) {
      const growthRate = (final - initial) / Math.abs(initial);
      if (growthRate > 0.5) {
        score += 2;
        details.push(`Revenue grew by ${(growthRate * 100).toFixed(1)}% over the full period (strong growth).`);
      } else {
        score += 1;
        details.push(`Revenue growth is positive but under 50% cumulatively (${(growthRate * 100).toFixed(1)}%).`);
      }
    } else {
      details.push('Revenue did not grow significantly or data insufficient.');
    }
  } else {
    details.push('Not enough revenue data for multi-period trend.');
  }

  // 2. Operating margin and free cash flow consistency
  const fcfVals = metrics.map(item => item.freeCashFlow).filter(f => f !== undefined) as number[];
  const opMarginVals = metrics.map(item => item.operatingMargin).filter(m => m !== undefined) as number[];

  if (opMarginVals.length) {
    const above15 = opMarginVals.filter(m => m > 0.15).length;
    if (above15 >= Math.floor(opMarginVals.length / 2) + 1) {
      score += 2;
      details.push('Operating margins have often exceeded 15% (indicates good profitability).');
    } else {
      details.push('Operating margin not consistently above 15%.');
    }
  } else {
    details.push('No operating margin data across periods.');
  }

  if (fcfVals.length) {
    const positiveFcf = fcfVals.filter(f => f > 0).length;
    if (positiveFcf >= Math.floor(fcfVals.length / 2) + 1) {
      score += 1;
      details.push('Majority of periods show positive free cash flow.');
    } else {
      details.push('Free cash flow not consistently positive.');
    }
  } else {
    details.push('No free cash flow data across periods.');
  }

  // 3. ROE check (if available)
  if (latest && typeof latest.returnOnEquity === 'number') {
    if (latest.returnOnEquity > 0.15) {
      score += 2;
      details.push(`High ROE of ${(latest.returnOnEquity * 100).toFixed(1)}%, indicating a competitive advantage.`);
    } else {
      details.push(`ROE of ${(latest.returnOnEquity * 100).toFixed(1)}% is moderate.`);
    }
  } else {
    details.push('ROE data not available.');
  }

  return { score, details: details.join('; ') };
}

// Analyze financial discipline: debt, dividends, buybacks
function analyzeFinancialDiscipline(metrics: FinancialLineItem[]): AnalysisResult {
  let score = 0;
  const details: string[] = [];

  // 1. Multi-period debt ratio
  const debtToEquityVals = metrics.map(item => item.debtToEquity).filter(d => d !== undefined) as number[];
  if (debtToEquityVals.length) {
    const belowOne = debtToEquityVals.filter(d => d < 1.0).length;
    if (belowOne >= Math.floor(debtToEquityVals.length / 2) + 1) {
      score += 2;
      details.push('Debt-to-equity < 1.0 for the majority of periods (reasonable leverage).');
    } else {
      details.push('Debt-to-equity >= 1.0 in many periods (could be high leverage).');
    }
  } else {
    details.push('No consistent leverage ratio data available.');
  }

  // 2. Dividends
  const dividendsList = metrics.map(item => item.dividendsAndOtherCashDistributions).filter(d => d !== undefined) as number[];
  if (dividendsList.length) {
    const payingDividends = dividendsList.filter(d => d < 0).length;
    if (payingDividends >= Math.floor(dividendsList.length / 2) + 1) {
      score += 1;
      details.push('Company has a history of returning capital to shareholders (dividends).');
    } else {
      details.push('Dividends not consistently paid or no data on distributions.');
    }
  } else {
    details.push('No dividend data found across periods.');
  }

  // 3. Buybacks (decreasing share count)
  const shares = metrics.map(item => item.outstandingShares).filter(s => s !== undefined) as number[];
  if (shares.length >= 2) {
    if (shares[0] < shares[shares.length - 1]) {
      score += 1;
      details.push('Outstanding shares have decreased over time (possible buybacks).');
    } else {
      details.push('Outstanding shares have not decreased over the available periods.');
    }
  } else {
    details.push('No multi-period share count data to assess buybacks.');
  }

  return { score, details: details.join('; ') };
}

// Analyze activism potential: revenue growth + low margin
function analyzeActivismPotential(metrics: FinancialLineItem[]): AnalysisResult {
  if (!metrics.length) {
    return { score: 0, details: 'Insufficient data for activism potential' };
  }
  const revenues = metrics.map(item => item.revenue).filter(r => r !== undefined) as number[];
  const opMargins = metrics.map(item => item.operatingMargin).filter(m => m !== undefined) as number[];
  if (revenues.length < 2 || !opMargins.length) {
    return { score: 0, details: 'Not enough data to assess activism potential (need multi-year revenue + margins).' };
  }
  const initial = revenues[revenues.length - 1];
  const final = revenues[0];
  const revenueGrowth = initial ? (final - initial) / Math.abs(initial) : 0;
  const avgMargin = opMargins.reduce((a, b) => a + b, 0) / opMargins.length;
  let score = 0;
  const details: string[] = [];
  if (revenueGrowth > 0.15 && avgMargin < 0.10) {
    score += 2;
    details.push(`Revenue growth is healthy (~${(revenueGrowth * 100).toFixed(1)}%), but margins are low (avg ${(avgMargin * 100).toFixed(1)}%). Activism could unlock margin improvements.`);
  } else {
    details.push('No clear sign of activism opportunity (either margins are already decent or growth is weak).');
  }
  return { score, details: details.join('; ') };
}

// Analyze valuation: DCF with FCF, margin of safety
function analyzeValuation(metrics: FinancialLineItem[], marketCap: number): AnalysisResult {
  if (!metrics.length || marketCap === undefined || marketCap === null) {
    return { score: 0, details: 'Insufficient data to perform valuation' };
  }
  const latest = metrics[0];
  const fcf = latest.freeCashFlow || 0;
  if (fcf <= 0) {
    return { score: 0, details: `No positive FCF for valuation; FCF = ${fcf}` };
  }
  const growthRate = 0.06;
  const discountRate = 0.10;
  const terminalMultiple = 15;
  const projectionYears = 5;
  let presentValue = 0;
  for (let year = 1; year <= projectionYears; year++) {
    const futureFcf = fcf * Math.pow(1 + growthRate, year);
    const pv = futureFcf / Math.pow(1 + discountRate, year);
    presentValue += pv;
  }
  const terminalValue = (fcf * Math.pow(1 + growthRate, projectionYears) * terminalMultiple) / Math.pow(1 + discountRate, projectionYears);
  const intrinsicValue = presentValue + terminalValue;
  const marginOfSafety = (intrinsicValue - marketCap) / marketCap;
  let score = 0;
  if (marginOfSafety > 0.3) {
    score += 3;
  } else if (marginOfSafety > 0.1) {
    score += 1;
  }
  const details = [
    `Calculated intrinsic value: ~${intrinsicValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    `Market cap: ~${marketCap.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    `Margin of safety: ${(marginOfSafety * 100).toFixed(1)}%`
  ];
  return { score, details: details.join('; '), intrinsicValue, marginOfSafety };
}

// Main Bill Ackman strategy function
export function billAckmanStrategy(
  stockData: StockData,
  financialHistory: FinancialLineItem[],
  marketCap: number
): BillAckmanSignal {
  // Use the most recent period as latest
  const latest = financialHistory[0] || {};
  // Run all analysis modules
  const quality = analyzeBusinessQuality(financialHistory, latest);
  const discipline = analyzeFinancialDiscipline(financialHistory);
  const activism = analyzeActivismPotential(financialHistory);
  const valuation = analyzeValuation(financialHistory, marketCap);
  // Aggregate scores
  const totalScore = quality.score + discipline.score + activism.score + valuation.score;
  const maxPossibleScore = 20; // 5 from each module
  // Generate signal
  let signal: Signal = 'neutral';
  if (totalScore >= 0.7 * maxPossibleScore) {
    signal = 'bullish';
  } else if (totalScore <= 0.3 * maxPossibleScore) {
    signal = 'bearish';
  }
  // Confidence: proportional to score
  const confidence = Math.round((totalScore / maxPossibleScore) * 100);
  // Reasoning: combine all details
  const reasoning = [
    'Business Quality: ' + quality.details,
    'Financial Discipline: ' + discipline.details,
    'Activism Potential: ' + activism.details,
    'Valuation: ' + valuation.details,
    `Total Score: ${totalScore}/${maxPossibleScore}`,
    `Final Signal: ${signal}, Confidence: ${confidence}%`
  ].join('\n');
  return {
    signal,
    confidence,
    reasoning
  };
}

// Placeholder for LLM/prompt call (not implemented here)
// You can implement OpenAI/LLM call as needed, similar to generate_ackman_output in Python 
// LLM call for Bill Ackman agent
export async function generateAckmanOutput(
    ticker: string,
    analysisData: any,
    apiKey: string
  ): Promise<BillAckmanSignal> {
    const openai = new OpenAI({ apiKey });
    // System prompt
    const systemPrompt = `You are a Bill Ackman AI agent, making investment decisions using his principles:
  1. Seek high-quality businesses with durable competitive advantages (moats), often in well-known consumer or service brands.
  2. Prioritize consistent free cash flow and growth potential over the long term.
  3. Advocate for strong financial discipline (reasonable leverage, efficient capital allocation).
  4. Valuation matters: target intrinsic value with a margin of safety.
  5. Consider activism where management or operational improvements can unlock substantial upside.
  6. Concentrate on a few high-conviction investments.
  
  In your reasoning:
  - Emphasize brand strength, moat, or unique market positioning.
  - Review free cash flow generation and margin trends as key signals.
  - Analyze leverage, share buybacks, and dividends as capital discipline metrics.
  - Provide a valuation assessment with numerical backup (DCF, multiples, etc.).
  - Identify any catalysts for activism or value creation (e.g., cost cuts, better capital allocation).
  - Use a confident, analytic, and sometimes confrontational tone when discussing weaknesses or opportunities.
  
  Return your final recommendation (signal: bullish, neutral, or bearish) with a 0-100 confidence and a thorough reasoning section.`;
  
    // User prompt
    const userPrompt = `Based on the following analysis, create an Ackman-style investment signal.
  
  Analysis Data for ${ticker}:
  ${JSON.stringify(analysisData, null, 2)}
  
  Return your output in strictly valid JSON:
  {
    "signal": "bullish" | "bearish" | "neutral",
    "confidence": float (0-100),
    "reasoning": "string"
  }`;
  
    try {
      console.log('[Ackman] Starting Ackman strategy analysis...');
      console.log('[Ackman] About to call OpenAI for Ackman analysis...');
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
  
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // 清理掉控制字符，防止 JSON.parse 报错
        const cleanJson = jsonMatch[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        try {
          const result = JSON.parse(cleanJson) as BillAckmanSignal;
          console.log('[Ackman] OpenAI response:', response);
          return result;
        } catch (parseError) {
          console.error('Ackman JSON parse error:', parseError, '\n原始内容:', cleanJson);
          throw parseError;
        }
      }
      throw new Error('Unable to extract JSON from response');
    } catch (error) {
      // Return default neutral signal on error
      console.error('Error executing Ackman strategy:', error);
      return {
        signal: 'neutral',
        confidence: 0,
        reasoning: 'Error in analysis, defaulting to neutral'
      };
    }
  }