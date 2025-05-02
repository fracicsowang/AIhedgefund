import { OpenAI } from 'openai';
import { StockData } from '@/types';

export type CathieWoodSignal = {
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  reasoning: string;
};

// --- 分析模块 ---

function analyzeDisruptivePotential(metrics: any[], financialLineItems: any[]): { score: number; details: string } {
  let score = 0;
  const details: string[] = [];
  if (!metrics || !financialLineItems) {
    return { score: 0, details: 'Insufficient data to analyze disruptive potential' };
  }
  // 1. Revenue Growth Analysis
  const revenues = financialLineItems.map(item => item.revenue).filter(Boolean);
  if (revenues.length >= 3) {
    const growthRates = [];
    for (let i = 0; i < revenues.length - 1; i++) {
      if (revenues[i] && revenues[i + 1]) {
        const growthRate = (revenues[i] - revenues[i + 1]) / Math.abs(revenues[i + 1] || 1);
        growthRates.push(growthRate);
      }
    }
    if (growthRates.length >= 2 && growthRates[0] > growthRates[growthRates.length - 1]) {
      score += 2;
      details.push(`Revenue growth is accelerating: ${(growthRates[0] * 100).toFixed(1)}% vs ${(growthRates[growthRates.length - 1] * 100).toFixed(1)}%`);
    }
    const latestGrowth = growthRates[0] || 0;
    if (latestGrowth > 1.0) {
      score += 3;
      details.push(`Exceptional revenue growth: ${(latestGrowth * 100).toFixed(1)}%`);
    } else if (latestGrowth > 0.5) {
      score += 2;
      details.push(`Strong revenue growth: ${(latestGrowth * 100).toFixed(1)}%`);
    } else if (latestGrowth > 0.2) {
      score += 1;
      details.push(`Moderate revenue growth: ${(latestGrowth * 100).toFixed(1)}%`);
    }
  } else {
    details.push('Insufficient revenue data for growth analysis');
  }
  // 2. Gross Margin Analysis
  const grossMargins = financialLineItems.map(item => item.gross_margin).filter(m => m !== undefined && m !== null);
  if (grossMargins.length >= 2) {
    const marginTrend = grossMargins[0] - grossMargins[grossMargins.length - 1];
    if (marginTrend > 0.05) {
      score += 2;
      details.push(`Expanding gross margins: +${(marginTrend * 100).toFixed(1)}%`);
    } else if (marginTrend > 0) {
      score += 1;
      details.push(`Slightly improving gross margins: +${(marginTrend * 100).toFixed(1)}%`);
    }
    if (grossMargins[0] > 0.5) {
      score += 2;
      details.push(`High gross margin: ${(grossMargins[0] * 100).toFixed(1)}%`);
    }
  } else {
    details.push('Insufficient gross margin data');
  }
  // 3. Operating Leverage Analysis
  const operatingExpenses = financialLineItems.map(item => item.operating_expense).filter(Boolean);
  if (revenues.length >= 2 && operatingExpenses.length >= 2) {
    const revGrowth = (revenues[0] - revenues[revenues.length - 1]) / Math.abs(revenues[revenues.length - 1] || 1);
    const opexGrowth = (operatingExpenses[0] - operatingExpenses[operatingExpenses.length - 1]) / Math.abs(operatingExpenses[operatingExpenses.length - 1] || 1);
    if (revGrowth > opexGrowth) {
      score += 2;
      details.push('Positive operating leverage: Revenue growing faster than expenses');
    }
  } else {
    details.push('Insufficient data for operating leverage analysis');
  }
  // 4. R&D Investment Analysis
  const rdExpenses = financialLineItems.map(item => item.research_and_development).filter(m => m !== undefined && m !== null);
  if (rdExpenses.length && revenues.length) {
    const rdIntensity = rdExpenses[0] / revenues[0];
    if (rdIntensity > 0.15) {
      score += 3;
      details.push(`High R&D investment: ${(rdIntensity * 100).toFixed(1)}% of revenue`);
    } else if (rdIntensity > 0.08) {
      score += 2;
      details.push(`Moderate R&D investment: ${(rdIntensity * 100).toFixed(1)}% of revenue`);
    } else if (rdIntensity > 0.05) {
      score += 1;
      details.push(`Some R&D investment: ${(rdIntensity * 100).toFixed(1)}% of revenue`);
    }
  } else {
    details.push('No R&D data available');
  }
  // Normalize score to 5
  const maxPossibleScore = 12;
  const normalizedScore = (score / maxPossibleScore) * 5;
  return { score: normalizedScore, details: details.join('; ') };
}

function analyzeInnovationGrowth(metrics: any[], financialLineItems: any[]): { score: number; details: string } {
  let score = 0;
  const details: string[] = [];
  if (!metrics || !financialLineItems) {
    return { score: 0, details: 'Insufficient data to analyze innovation-driven growth' };
  }
  // 1. R&D Investment Trends
  const rdExpenses = financialLineItems.map(item => item.research_and_development).filter(Boolean);
  const revenues = financialLineItems.map(item => item.revenue).filter(Boolean);
  if (rdExpenses.length >= 2 && revenues.length >= 2) {
    const rdGrowth = (rdExpenses[0] - rdExpenses[rdExpenses.length - 1]) / Math.abs(rdExpenses[rdExpenses.length - 1] || 1);
    if (rdGrowth > 0.5) {
      score += 3;
      details.push(`Strong R&D investment growth: +${(rdGrowth * 100).toFixed(1)}%`);
    } else if (rdGrowth > 0.2) {
      score += 2;
      details.push(`Moderate R&D investment growth: +${(rdGrowth * 100).toFixed(1)}%`);
    }
    const rdIntensityStart = rdExpenses[rdExpenses.length - 1] / revenues[revenues.length - 1];
    const rdIntensityEnd = rdExpenses[0] / revenues[0];
    if (rdIntensityEnd > rdIntensityStart) {
      score += 2;
      details.push(`Increasing R&D intensity: ${(rdIntensityEnd * 100).toFixed(1)}% vs ${(rdIntensityStart * 100).toFixed(1)}%`);
    }
  } else {
    details.push('Insufficient R&D data for trend analysis');
  }
  // 2. Free Cash Flow Analysis
  const fcfVals = financialLineItems.map(item => item.free_cash_flow).filter(Boolean);
  if (fcfVals.length >= 2) {
    const fcfGrowth = (fcfVals[0] - fcfVals[fcfVals.length - 1]) / Math.abs(fcfVals[fcfVals.length - 1] || 1);
    const positiveFcfCount = fcfVals.filter(f => f > 0).length;
    if (fcfGrowth > 0.3 && positiveFcfCount === fcfVals.length) {
      score += 3;
      details.push('Strong and consistent FCF growth, excellent innovation funding capacity');
    } else if (positiveFcfCount >= fcfVals.length * 0.75) {
      score += 2;
      details.push('Consistent positive FCF, good innovation funding capacity');
    } else if (positiveFcfCount > fcfVals.length * 0.5) {
      score += 1;
      details.push('Moderately consistent FCF, adequate innovation funding capacity');
    }
  } else {
    details.push('Insufficient FCF data for analysis');
  }
  // 3. Operating Efficiency Analysis
  const opMarginVals = financialLineItems.map(item => item.operating_margin).filter(Boolean);
  if (opMarginVals.length >= 2) {
    const marginTrend = opMarginVals[0] - opMarginVals[opMarginVals.length - 1];
    if (opMarginVals[0] > 0.15 && marginTrend > 0) {
      score += 3;
      details.push(`Strong and improving operating margin: ${(opMarginVals[0] * 100).toFixed(1)}%`);
    } else if (opMarginVals[0] > 0.10) {
      score += 2;
      details.push(`Healthy operating margin: ${(opMarginVals[0] * 100).toFixed(1)}%`);
    } else if (marginTrend > 0) {
      score += 1;
      details.push('Improving operating efficiency');
    }
  } else {
    details.push('Insufficient operating margin data');
  }
  // 4. Capital Allocation Analysis
  const capex = financialLineItems.map(item => item.capital_expenditure).filter(Boolean);
  if (capex.length >= 2 && revenues.length >= 2) {
    const capexIntensity = Math.abs(capex[0]) / revenues[0];
    const capexGrowth = (Math.abs(capex[0]) - Math.abs(capex[capex.length - 1])) / Math.abs(capex[capex.length - 1] || 1);
    if (capexIntensity > 0.10 && capexGrowth > 0.2) {
      score += 2;
      details.push('Strong investment in growth infrastructure');
    } else if (capexIntensity > 0.05) {
      score += 1;
      details.push('Moderate investment in growth infrastructure');
    }
  } else {
    details.push('Insufficient CAPEX data');
  }
  // 5. Growth Reinvestment Analysis
  const dividends = financialLineItems.map(item => item.dividends_and_other_cash_distributions).filter(Boolean);
  if (dividends.length && fcfVals.length) {
    const latestPayoutRatio = dividends[0] / fcfVals[0];
    if (latestPayoutRatio < 0.2) {
      score += 2;
      details.push('Strong focus on reinvestment over dividends');
    } else if (latestPayoutRatio < 0.4) {
      score += 1;
      details.push('Moderate focus on reinvestment over dividends');
    }
  } else {
    details.push('Insufficient dividend data');
  }
  // Normalize score to 5
  const maxPossibleScore = 15;
  const normalizedScore = (score / maxPossibleScore) * 5;
  return { score: normalizedScore, details: details.join('; ') };
}

function analyzeCathieWoodValuation(financialLineItems: any[], marketCap: number): { score: number; details: string; intrinsicValue?: number; marginOfSafety?: number } {
  if (!financialLineItems || marketCap == null) {
    return { score: 0, details: 'Insufficient data for valuation' };
  }
  const latest = financialLineItems[0];
  const fcf = latest.free_cash_flow || 0;
  if (fcf <= 0) {
    return { score: 0, details: `No positive FCF for valuation; FCF = ${fcf}` };
  }
  const growthRate = 0.20;
  const discountRate = 0.15;
  const terminalMultiple = 25;
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
  if (marginOfSafety > 0.5) {
    score += 3;
  } else if (marginOfSafety > 0.2) {
    score += 1;
  }
  const details = [
    `Calculated intrinsic value: ~${intrinsicValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    `Market cap: ~${marketCap.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    `Margin of safety: ${(marginOfSafety * 100).toFixed(1)}%`
  ];
  return { score, details: details.join('; '), intrinsicValue, marginOfSafety };
}

// --- LLM 调用 ---
export async function generateCathieWoodOutput(
  ticker: string,
  analysisData: any,
  apiKey: string
): Promise<CathieWoodSignal> {
  const openai = new OpenAI({ apiKey });
  const systemPrompt = `You are a Cathie Wood AI agent, making investment decisions using her principles:

1. Seek companies leveraging disruptive innovation.
2. Emphasize exponential growth potential, large TAM.
3. Focus on technology, healthcare, or other future-facing sectors.
4. Consider multi-year time horizons for potential breakthroughs.
5. Accept higher volatility in pursuit of high returns.
6. Evaluate management's vision and ability to invest in R&D.

Rules:
- Identify disruptive or breakthrough technology.
- Evaluate strong potential for multi-year revenue growth.
- Check if the company can scale effectively in a large market.
- Use a growth-biased valuation approach.
- Provide a data-driven recommendation (bullish, bearish, or neutral).

When providing your reasoning, be thorough and specific by:
1. Identifying the specific disruptive technologies/innovations the company is leveraging
2. Highlighting growth metrics that indicate exponential potential (revenue acceleration, expanding TAM)
3. Discussing the long-term vision and transformative potential over 5+ year horizons
4. Explaining how the company might disrupt traditional industries or create new markets
5. Addressing R&D investment and innovation pipeline that could drive future growth
6. Using Cathie Wood's optimistic, future-focused, and conviction-driven voice

For example, if bullish: "The company's AI-driven platform is transforming the $500B healthcare analytics market, with evidence of platform adoption accelerating from 40% to 65% YoY. Their R&D investments of 22% of revenue are creating a technological moat that positions them to capture a significant share of this expanding market. The current valuation doesn't reflect the exponential growth trajectory we expect as..."
For example, if bearish: "While operating in the genomics space, the company lacks truly disruptive technology and is merely incrementally improving existing techniques. R&D spending at only 8% of revenue signals insufficient investment in breakthrough innovation. With revenue growth slowing from 45% to 20% YoY, there's limited evidence of the exponential adoption curve we look for in transformative companies..."
`;
  const userPrompt = `Based on the following analysis, create a Cathie Wood-style investment signal.\n\nAnalysis Data for ${ticker}:\n${JSON.stringify(analysisData, null, 2)}\n\nReturn the trading signal in this JSON format:\n{\n  "signal": "bullish/bearish/neutral",\n  "confidence": float (0-100),\n  "reasoning": "string"\n}`;
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
        const result = JSON.parse(cleanJson) as CathieWoodSignal;
        return result;
      } catch (parseError) {
        console.error('CathieWood JSON parse error:', parseError, '\n原始内容:', cleanJson);
        throw parseError;
      }
    }
    throw new Error('Unable to extract JSON from response');
  } catch (error) {
    console.error('Error executing Cathie Wood strategy:', error);
    return {
      signal: 'neutral',
      confidence: 0,
      reasoning: 'Error in analysis, defaulting to neutral'
    };
  }
} 