import { OpenAI } from 'openai';
import { StockData } from '@/types';

export type StanleyDruckenmillerSignal = {
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  reasoning: string;
};

// --- 分析模块 ---

function analyzeGrowthAndMomentum(financialLineItems: any[], prices: any[]): { score: number; details: string } {
  if (!financialLineItems || financialLineItems.length < 2) {
    return { score: 0, details: 'Insufficient financial data for growth analysis' };
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
      if (revGrowth > 0.3) {
        rawScore += 3;
        details.push(`Strong revenue growth: ${(revGrowth * 100).toFixed(1)}%`);
      } else if (revGrowth > 0.15) {
        rawScore += 2;
        details.push(`Moderate revenue growth: ${(revGrowth * 100).toFixed(1)}%`);
      } else if (revGrowth > 0.05) {
        rawScore += 1;
        details.push(`Slight revenue growth: ${(revGrowth * 100).toFixed(1)}%`);
      } else {
        details.push(`Minimal/negative revenue growth: ${(revGrowth * 100).toFixed(1)}%`);
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
      if (epsGrowth > 0.3) {
        rawScore += 3;
        details.push(`Strong EPS growth: ${(epsGrowth * 100).toFixed(1)}%`);
      } else if (epsGrowth > 0.15) {
        rawScore += 2;
        details.push(`Moderate EPS growth: ${(epsGrowth * 100).toFixed(1)}%`);
      } else if (epsGrowth > 0.05) {
        rawScore += 1;
        details.push(`Slight EPS growth: ${(epsGrowth * 100).toFixed(1)}%`);
      } else {
        details.push(`Minimal/negative EPS growth: ${(epsGrowth * 100).toFixed(1)}%`);
      }
    } else {
      details.push('Oldest EPS near zero; skipping EPS growth calculation.');
    }
  } else {
    details.push('Not enough EPS data points for growth calculation.');
  }
  // Price Momentum
  if (prices && prices.length > 30) {
    const sortedPrices = prices.slice().sort((a: any, b: any) => a.time - b.time);
    const closePrices = sortedPrices.map((p: any) => p.close).filter((v: any) => v != null);
    if (closePrices.length >= 2) {
      const startPrice = closePrices[0];
      const endPrice = closePrices[closePrices.length - 1];
      if (startPrice > 0) {
        const pctChange = (endPrice - startPrice) / startPrice;
        if (pctChange > 0.5) {
          rawScore += 3;
          details.push(`Very strong price momentum: ${(pctChange * 100).toFixed(1)}%`);
        } else if (pctChange > 0.2) {
          rawScore += 2;
          details.push(`Moderate price momentum: ${(pctChange * 100).toFixed(1)}%`);
        } else if (pctChange > 0) {
          rawScore += 1;
          details.push(`Slight positive momentum: ${(pctChange * 100).toFixed(1)}%`);
        } else {
          details.push(`Negative price momentum: ${(pctChange * 100).toFixed(1)}%`);
        }
      } else {
        details.push('Invalid start price (<= 0); cannot compute momentum.');
      }
    } else {
      details.push('Insufficient price data for momentum calculation.');
    }
  } else {
    details.push('Not enough recent price data for momentum analysis.');
  }
  const finalScore = Math.min(10, (rawScore / 9) * 10);
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

function analyzeRiskReward(financialLineItems: any[], prices: any[]): { score: number; details: string } {
  if (!financialLineItems || !prices) {
    return { score: 0, details: 'Insufficient data for risk-reward analysis' };
  }
  let rawScore = 0;
  const details: string[] = [];
  // Debt-to-Equity
  const debtValues = financialLineItems.map((fi: any) => fi.total_debt).filter((v: any) => v != null);
  const eqValues = financialLineItems.map((fi: any) => fi.shareholders_equity).filter((v: any) => v != null);
  if (debtValues.length && eqValues.length && debtValues.length === eqValues.length) {
    const recentDebt = debtValues[0];
    const recentEq = eqValues[0] || 1e-9;
    const dte = recentDebt / recentEq;
    if (dte < 0.3) {
      rawScore += 3;
      details.push(`Low debt-to-equity: ${dte.toFixed(2)}`);
    } else if (dte < 0.7) {
      rawScore += 2;
      details.push(`Moderate debt-to-equity: ${dte.toFixed(2)}`);
    } else if (dte < 1.5) {
      rawScore += 1;
      details.push(`Somewhat high debt-to-equity: ${dte.toFixed(2)}`);
    } else {
      details.push(`High debt-to-equity: ${dte.toFixed(2)}`);
    }
  } else {
    details.push('No consistent debt/equity data available.');
  }
  // Price Volatility
  if (prices.length > 10) {
    const sortedPrices = prices.slice().sort((a: any, b: any) => a.time - b.time);
    const closePrices = sortedPrices.map((p: any) => p.close).filter((v: any) => v != null);
    if (closePrices.length > 10) {
      const dailyReturns: number[] = [];
      for (let i = 1; i < closePrices.length; i++) {
        const prevClose = closePrices[i - 1];
        if (prevClose > 0) {
          dailyReturns.push((closePrices[i] - prevClose) / prevClose);
        }
      }
      if (dailyReturns.length) {
        const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
        const stdev = Math.sqrt(dailyReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / dailyReturns.length);
        if (stdev < 0.01) {
          rawScore += 3;
          details.push(`Low volatility: daily returns stdev ${(stdev * 100).toFixed(2)}%`);
        } else if (stdev < 0.02) {
          rawScore += 2;
          details.push(`Moderate volatility: daily returns stdev ${(stdev * 100).toFixed(2)}%`);
        } else if (stdev < 0.04) {
          rawScore += 1;
          details.push(`High volatility: daily returns stdev ${(stdev * 100).toFixed(2)}%`);
        } else {
          details.push(`Very high volatility: daily returns stdev ${(stdev * 100).toFixed(2)}%`);
        }
      } else {
        details.push('Insufficient daily returns data for volatility calc.');
      }
    } else {
      details.push('Not enough close-price data points for volatility analysis.');
    }
  } else {
    details.push('Not enough price data for volatility analysis.');
  }
  const finalScore = Math.min(10, (rawScore / 6) * 10);
  return { score: finalScore, details: details.join('; ') };
}

function analyzeDruckenmillerValuation(financialLineItems: any[], marketCap: number): { score: number; details: string } {
  if (!financialLineItems || marketCap == null) {
    return { score: 0, details: 'Insufficient data to perform valuation' };
  }
  let rawScore = 0;
  const details: string[] = [];
  // P/E
  const netIncomes = financialLineItems.map((fi: any) => fi.net_income).filter((v: any) => v != null);
  const fcfValues = financialLineItems.map((fi: any) => fi.free_cash_flow).filter((v: any) => v != null);
  const ebitValues = financialLineItems.map((fi: any) => fi.ebit).filter((v: any) => v != null);
  const ebitdaValues = financialLineItems.map((fi: any) => fi.ebitda).filter((v: any) => v != null);
  const debtValues = financialLineItems.map((fi: any) => fi.total_debt).filter((v: any) => v != null);
  const cashValues = financialLineItems.map((fi: any) => fi.cash_and_equivalents).filter((v: any) => v != null);
  const recentDebt = debtValues[0] || 0;
  const recentCash = cashValues[0] || 0;
  const enterpriseValue = marketCap + recentDebt - recentCash;
  // P/E
  const recentNetIncome = netIncomes[0];
  if (recentNetIncome && recentNetIncome > 0) {
    const pe = marketCap / recentNetIncome;
    if (pe < 15) {
      rawScore += 2;
      details.push(`Attractive P/E: ${pe.toFixed(2)}`);
    } else if (pe < 25) {
      rawScore += 1;
      details.push(`Fair P/E: ${pe.toFixed(2)}`);
    } else {
      details.push(`High or Very high P/E: ${pe.toFixed(2)}`);
    }
  } else {
    details.push('No positive net income for P/E calculation');
  }
  // P/FCF
  const recentFcf = fcfValues[0];
  if (recentFcf && recentFcf > 0) {
    const pfcf = marketCap / recentFcf;
    if (pfcf < 15) {
      rawScore += 2;
      details.push(`Attractive P/FCF: ${pfcf.toFixed(2)}`);
    } else if (pfcf < 25) {
      rawScore += 1;
      details.push(`Fair P/FCF: ${pfcf.toFixed(2)}`);
    } else {
      details.push(`High/Very high P/FCF: ${pfcf.toFixed(2)}`);
    }
  } else {
    details.push('No positive free cash flow for P/FCF calculation');
  }
  // EV/EBIT
  const recentEbit = ebitValues[0];
  if (enterpriseValue > 0 && recentEbit && recentEbit > 0) {
    const evEbit = enterpriseValue / recentEbit;
    if (evEbit < 15) {
      rawScore += 2;
      details.push(`Attractive EV/EBIT: ${evEbit.toFixed(2)}`);
    } else if (evEbit < 25) {
      rawScore += 1;
      details.push(`Fair EV/EBIT: ${evEbit.toFixed(2)}`);
    } else {
      details.push(`High EV/EBIT: ${evEbit.toFixed(2)}`);
    }
  } else {
    details.push('No valid EV/EBIT because EV <= 0 or EBIT <= 0');
  }
  // EV/EBITDA
  const recentEbitda = ebitdaValues[0];
  if (enterpriseValue > 0 && recentEbitda && recentEbitda > 0) {
    const evEbitda = enterpriseValue / recentEbitda;
    if (evEbitda < 10) {
      rawScore += 2;
      details.push(`Attractive EV/EBITDA: ${evEbitda.toFixed(2)}`);
    } else if (evEbitda < 18) {
      rawScore += 1;
      details.push(`Fair EV/EBITDA: ${evEbitda.toFixed(2)}`);
    } else {
      details.push(`High EV/EBITDA: ${evEbitda.toFixed(2)}`);
    }
  } else {
    details.push('No valid EV/EBITDA because EV <= 0 or EBITDA <= 0');
  }
  const finalScore = Math.min(10, (rawScore / 8) * 10);
  return { score: finalScore, details: details.join('; ') };
}

export async function generateDruckenmillerOutput(
  ticker: string,
  analysisData: any,
  apiKey: string
): Promise<StanleyDruckenmillerSignal> {
  // 构造 LLM prompt
  const systemPrompt = `You are a Stanley Druckenmiller AI agent, making investment decisions using his principles:\n\n1. Seek asymmetric risk-reward opportunities (large upside, limited downside).\n2. Emphasize growth, momentum, and market sentiment.\n3. Preserve capital by avoiding major drawdowns.\n4. Willing to pay higher valuations for true growth leaders.\n5. Be aggressive when conviction is high.\n6. Cut losses quickly if the thesis changes.\n\nRules:\n- Reward companies showing strong revenue/earnings growth and positive stock momentum.\n- Evaluate sentiment and insider activity as supportive or contradictory signals.\n- Watch out for high leverage or extreme volatility that threatens capital.\n- Output a JSON object with signal, confidence, and a reasoning string.\n\nWhen providing your reasoning, be thorough and specific by:\n1. Explaining the growth and momentum metrics that most influenced your decision\n2. Highlighting the risk-reward profile with specific numerical evidence\n3. Discussing market sentiment and catalysts that could drive price action\n4. Addressing both upside potential and downside risks\n5. Providing specific valuation context relative to growth prospects\n6. Using Stanley Druckenmiller's decisive, momentum-focused, and conviction-driven voice\n\nFor example, if bullish: "The company shows exceptional momentum with revenue accelerating from 22% to 35% YoY and the stock up 28% over the past three months. Risk-reward is highly asymmetric with 70% upside potential based on FCF multiple expansion and only 15% downside risk given the strong balance sheet with 3x cash-to-debt. Insider buying and positive market sentiment provide additional tailwinds..."\nFor example, if bearish: "Despite recent stock momentum, revenue growth has decelerated from 30% to 12% YoY, and operating margins are contracting. The risk-reward proposition is unfavorable with limited 10% upside potential against 40% downside risk. The competitive landscape is intensifying, and insider selling suggests waning confidence. I'm seeing better opportunities elsewhere with more favorable setups..."`;
  const userPrompt = `Based on the following analysis, create a Druckenmiller-style investment signal.\n\nAnalysis Data for ${ticker}:\n${JSON.stringify(analysisData, null, 2)}\n\nReturn the trading signal in this JSON format:\n{\n  "signal": "bullish/bearish/neutral",\n  "confidence": float (0-100),\n  "reasoning": "string"\n}`;

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
  console.log('[Stanley Druckenmiller] OpenAI 原始返回内容:', content);
  // 提取 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const cleanJson = jsonMatch[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    try {
      const result = JSON.parse(cleanJson) as StanleyDruckenmillerSignal;
      console.log('[Druckenmiller] OpenAI response:', result);
      return result;
    } catch (parseError) {
      console.error('Druckenmiller JSON parse error:', parseError, '\n原始内容:', cleanJson);
      throw parseError;
    }
  }
  throw new Error('Unable to extract JSON from response');
} 