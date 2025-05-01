import { StockData } from '@/types';
import OpenAI from 'openai';

/**
 * Ben Graham signal types
 */
type SignalType = 'BUY' | 'SELL' | 'HOLD';
type GrahamSignalType = 'bullish' | 'bearish' | 'neutral';

interface BenGrahamSignal {
  signal: GrahamSignalType;
  confidence: number;
  reasoning: string;
}

interface FinancialLineItem {
  earnings_per_share?: number;
  revenue?: number;
  net_income?: number;
  book_value_per_share?: number;
  total_assets?: number;
  total_liabilities?: number;
  current_assets?: number;
  current_liabilities?: number;
  dividends_and_other_cash_distributions?: number;
  outstanding_shares?: number;
  current_ratio?: number;
  debt_to_equity?: number;
  market_cap?: number;
}

interface GrahamAnalysisResult {
  score: number;
  details: string;
}

/**
 * Ben Graham Strategy - Father of Value Investing
 * Focuses on margin of safety, looking for undervalued stocks
 */
export async function benGrahamStrategy(stockData: StockData, apiKey: string | null = null): Promise<{
  decision: SignalType;
  reasoning: string;
  confidence?: number;
  detailedAnalysis?: string;
}> {
  // Validate required fields
  if (!stockData.earningsPerShare || !stockData.currentRatio || !stockData.debtToEquity || !stockData.marketCap) {
    console.error('[BenGraham] Missing required fields in stockData:', stockData);
    throw new Error('Missing required fields in stockData');
  }

  // Extract metrics
  const eps = stockData.earningsPerShare;
  const currentRatio = stockData.currentRatio;
  const debtToEquity = stockData.debtToEquity;
  const marketCap = stockData.marketCap;

  // Log extracted metrics
  console.log('[BenGraham] Extracted metrics:', { eps, currentRatio, debtToEquity, marketCap });

  try {
    // Analyze earnings stability
    const earningsAnalysis = analyzeEarningsStability({ earnings_per_share: eps });
    
    // Analyze financial strength
    const strengthAnalysis = analyzeFinancialStrength({ current_ratio: currentRatio, debt_to_equity: debtToEquity });
    
    // Analyze valuation
    const valuationAnalysis = analyzeValuationGraham({ earnings_per_share: eps, book_value_per_share: 1 }, marketCap);
    
    // Calculate total score
    const totalScore = earningsAnalysis.score + strengthAnalysis.score + valuationAnalysis.score;
    const maxPossibleScore = 15; // Total possible score from all analysis functions
    
    // Generate detailed analysis results
    const analysisData = {
      signal: mapScoreToSignal(totalScore, maxPossibleScore),
      score: totalScore,
      max_score: maxPossibleScore,
      earnings_analysis: earningsAnalysis,
      strength_analysis: strengthAnalysis,
      valuation_analysis: valuationAnalysis
    };
    
    // Decide whether to use OpenAI
    if (apiKey) {
      console.log('Attempting to use OpenAI for analysis...');
      try {
        const grahamSignal = await generateGrahamOutput(stockData.symbol || '', analysisData, apiKey);
        return mapGrahamSignalToDecision(grahamSignal);
      } catch (error) {
        console.error('OpenAI analysis failed, falling back to basic algorithm:', error);
        return generateBasicDecision(analysisData);
      }
    } else {
      console.log('Using basic algorithm for analysis (OpenAI not used)');
      return generateBasicDecision(analysisData);
    }
  } catch (error) {
    console.error('BenGraham strategy analysis error:', error);
    return {
      decision: 'HOLD',
      reasoning: 'An error occurred during analysis, recommend holding until more data is available.'
    };
  }
}

/**
 * Calculate stock market capitalization
 */
function calculateMarketCap(stockData: StockData): number {
  // If stock price and outstanding shares are available, calculate market cap
  const price = stockData.price?.regularMarketPrice || 0;
  
  // Type conversion to access potentially missing properties
  interface ExtendedKeyStatistics {
    sharesOutstanding?: { raw?: number; fmt?: string };
  }
  
  interface ExtendedQuoteSummary {
    defaultKeyStatistics?: ExtendedKeyStatistics;
  }
  
  const quoteData = stockData.quoteSummary as unknown as ExtendedQuoteSummary || {};
  const sharesOutstanding = quoteData.defaultKeyStatistics?.sharesOutstanding?.raw || 0;
  
  return price * sharesOutstanding;
}

/**
 * Extract financial metrics from StockData
 */
function extractFinancialMetrics(stockData: StockData): FinancialLineItem {
  return {
    earnings_per_share: stockData.earningsPerShare ?? 0,
    book_value_per_share: stockData.bookValuePerShare ?? 0,
    outstanding_shares: stockData.sharesOutstanding ?? 0,
    current_ratio: stockData.currentRatio ?? 0,
    debt_to_equity: stockData.debtToEquity ?? 0,
    market_cap: stockData.marketCap ?? 0,
    // If you need more fields, add them here and ensure they are provided at the top level
  };
}

/**
 * Analyze earnings stability
 */
function analyzeEarningsStability(metrics: FinancialLineItem): GrahamAnalysisResult {
  let score = 0;
  const details: string[] = [];
  
  const eps = metrics.earnings_per_share || 0;
  
  // Basic EPS check - simplified handling with limited data
  if (eps > 0) {
    score += 3;
    details.push(`Positive earnings per share (${eps.toFixed(2)}), meets Graham's criteria.`);
  } else {
    details.push(`Current earnings per share is not positive (${eps.toFixed(2)}), does not meet Graham's earnings stability requirements.`);
  }
  
  // Note: Ideally, we should have multiple years of EPS data to analyze trends
  // If the API provides historical data, this section can be further refined
  
  return { score, details: details.join(' ') };
}

/**
 * Analyze financial strength
 */
function analyzeFinancialStrength(metrics: FinancialLineItem): GrahamAnalysisResult {
  let score = 0;
  const details: string[] = [];

  // Use current_ratio directly
  const currentRatio = metrics.current_ratio || 0;
  if (currentRatio >= 2.0) {
    score += 2;
    details.push(`Current ratio = ${currentRatio.toFixed(2)} (>=2.0: Good).`);
  } else if (currentRatio >= 1.5) {
    score += 1;
    details.push(`Current ratio = ${currentRatio.toFixed(2)} (Medium strength).`);
  } else if (currentRatio > 0) {
    details.push(`Current ratio = ${currentRatio.toFixed(2)} (<1.5: Weaker liquidity).`);
  } else {
    details.push(`Current ratio data is missing or zero.`);
  }

  // Use debt_to_equity directly
  const debtToEquity = metrics.debt_to_equity || 0;
  if (debtToEquity > 0) {
    details.push(`Debt to equity ratio = ${debtToEquity.toFixed(2)}.`);
  } else {
    details.push(`Debt to equity data is missing or zero.`);
  }

  return { score, details: details.join(' ') };
}

/**
 * Analyze Graham valuation
 */
function analyzeValuationGraham(metrics: FinancialLineItem, marketCap: number): GrahamAnalysisResult {
  let score = 0;
  const details: string[] = [];

  if (!marketCap || marketCap <= 0) {
    return { score: 0, details: "Missing market capitalization data, unable to perform valuation analysis" };
  }

  const bookValuePS = metrics.book_value_per_share || 0;
  const eps = metrics.earnings_per_share || 0;
  const sharesOutstanding = metrics.outstanding_shares || 0;

  // Graham number
  let grahamNumber = null;
  if (eps > 0 && bookValuePS > 0) {
    grahamNumber = Math.sqrt(22.5 * eps * bookValuePS);
    details.push(`Graham number = ${grahamNumber.toFixed(2)}`);
  } else {
    details.push(`Unable to calculate Graham number (EPS or book value per share missing/<=0).`);
  }

  // Margin of safety relative to Graham number
  if (grahamNumber && sharesOutstanding > 0) {
    const currentPrice = marketCap / sharesOutstanding;
    if (currentPrice > 0) {
      const marginOfSafety = (grahamNumber - currentPrice) / currentPrice;
      details.push(`Margin of safety (Graham number) = ${(marginOfSafety * 100).toFixed(2)}%`);
      if (marginOfSafety > 0.5) {
        score += 3;
        details.push(`Stock price significantly below Graham number (>=50% margin).`);
      } else if (marginOfSafety > 0.2) {
        score += 1;
        details.push(`Stock price slightly below Graham number, acceptable margin.`);
      } else {
        details.push(`Stock price near or above Graham number, low margin of safety.`);
      }
    } else {
      details.push(`Current price is zero or invalid; unable to calculate margin of safety.`);
    }
  }

  return { score, details: details.join(' ') };
}

/**
 * Map score to investment signal
 */
function mapScoreToSignal(totalScore: number, maxPossibleScore: number): GrahamSignalType {
  if (totalScore >= 0.7 * maxPossibleScore) {
    return "bullish";
  } else if (totalScore <= 0.3 * maxPossibleScore) {
    return "bearish";
  } else {
    return "neutral";
  }
}

/**
 * Map Graham signal to decision
 */
function mapGrahamSignalToDecision(signal: BenGrahamSignal): {
  decision: SignalType;
  reasoning: string;
  confidence: number;
} {
  const decisionMap: Record<GrahamSignalType, SignalType> = {
    "bullish": "BUY",
    "bearish": "SELL",
    "neutral": "HOLD"
  };
  
  return {
    decision: decisionMap[signal.signal],
    reasoning: signal.reasoning,
    confidence: signal.confidence
  };
}

/**
 * Generate basic decision, not using GPT
 */
function generateBasicDecision(analysisData: any): {
  decision: SignalType;
  reasoning: string;
  confidence: number;
  detailedAnalysis: string;
} {
  const decisionMap: Record<GrahamSignalType, SignalType> = {
    "bullish": "BUY",
    "bearish": "SELL",
    "neutral": "HOLD"
  };
  
  const decision = decisionMap[analysisData.signal as GrahamSignalType];
  const confidence = Math.round((analysisData.score / analysisData.max_score) * 100);
  
  let reasoning = `Graham analysis score: ${analysisData.score}/${analysisData.max_score}. `;
  reasoning += `Earnings stability: ${analysisData.earnings_analysis.details} `;
  reasoning += `Financial strength: ${analysisData.strength_analysis.details} `;
  reasoning += `Valuation: ${analysisData.valuation_analysis.details}`;

  const detailedAnalysis = `
## Graham Value Investment Analysis Details

### Basic Score
- Total Score: ${analysisData.score}/${analysisData.max_score}
- Confidence: ${confidence}%
- Final Signal: ${analysisData.signal}

### Earnings Stability Analysis
${analysisData.earnings_analysis.details}

### Financial Strength Analysis
${analysisData.strength_analysis.details}

### Valuation
${analysisData.valuation_analysis.details}

### Summary
Based on Graham's value investing principles, the current analysis suggests ${decision}.`;

  return { 
    decision, 
    reasoning, 
    confidence, 
    detailedAnalysis 
  };
}

/**
 * Use OpenAI to generate Graham-style output
 */
async function generateGrahamOutput(
  ticker: string,
  analysisData: any,
  apiKey: string
): Promise<BenGrahamSignal> {
  try {
    // Initialize OpenAI client
    // Handle possible line breaks
    apiKey = apiKey.replace(/\r?\n/g, '');
    
    console.log(`generateGrahamOutput: Using provided API key, length: ${apiKey.length}`);
    console.log(`OpenAI API key first 10 characters: ${apiKey.substring(0, 10)}...`);
    
    if (!apiKey || apiKey === 'Your OpenAI key') {
      console.error('OpenAI API key not set or placeholder');
      throw new Error('OpenAI API key not correctly configured');
    }
    
    // Hardcoded test - only for debugging, do not use in production
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    console.log('OpenAI client initialized, preparing to send request');
    
    // Prepare system prompt
    const systemPrompt = `You are Benjamin Graham AI agent, using his principles for investment decisions:
    1. Stick to margin of safety, buy stocks below intrinsic value (using Graham number, net-net, etc.).
    2. Emphasize company's financial strength (low leverage, ample current assets).
    3. Prefer stable long-term earnings.
    4. Consider dividend record for safety.
    5. Avoid speculation or high growth assumptions; focus on proven indicators.
    
    When providing your reasoning, please conduct thorough and specific analysis in the following ways:
    1. Explain the key valuation indicators that most influence your decision (Graham number, NCAV, P/E, etc.)
    2. Highlight specific financial strength indicators (current ratio, debt level, etc.)
    3. Refer to earnings stability or instability over time
    4. Provide quantitative evidence with precise numbers
    5. Compare current indicators to Graham's thresholds (e.g., "Current ratio 2.5 exceeds Graham's minimum 2.0")
    6. Use Benjamin Graham's conservative, analytical tone and style in your explanation
    
    For example, if bullish: "This stock trades at a 35% discount to net current asset value, providing a wide margin of safety. A current ratio of 2.5 and debt-to-equity of 0.3 indicate strong financial health..."
    For example, if bearish: "Despite consistent earnings, the current price of $50 exceeds our calculated Graham number of $35, offering no margin of safety. In addition, a current ratio of only 1.2 is below Graham's preferred 2.0 threshold..."
    
    Return a rational recommendation: bullish, bearish, or neutral, with a confidence level (0-100) and thorough reasoning.
    
    First provide a detailed analysis process explaining your thinking, then give the final decision.
    
    If some financial data is missing, please use your own knowledge, industry averages, or reasonable assumptions to supplement the analysis. Do not simply state that data is missing; always provide a reasoned investment opinion based on all available and inferable information.`;
    
    // Prepare user prompt
    const userPrompt = `Based on the following analysis, create a Graham-style investment signal:

    Analysis data for ${ticker}:
    ${JSON.stringify(analysisData, null, 2)}

    Please first provide a detailed analysis process, then return accurate JSON format:
    {
      "signal": "bullish" | "bearish" | "neutral",
      "confidence": float (0-100),
      "reasoning": "string",
      "detailedAnalysis": "detailed thought process and analysis"
    }`;
    
    // Log prompts for debugging
    console.log('[BenGraham] systemPrompt:', systemPrompt);
    console.log('[BenGraham] userPrompt:', userPrompt);
    // Call OpenAI API
    try {
      console.log('[BenGraham] About to call OpenAI API with prompt:', userPrompt);
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Can be changed to newer model if needed
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2, // Low temperature for more consistent results
        max_tokens: 1000
      });
      console.log('[BenGraham] OpenAI API call succeeded, response:', JSON.stringify(response));
      
      // Parse response
      const content = response.choices[0].message.content;
      if (!content) {
        console.error('OpenAI returned empty response');
        throw new Error('OpenAI returned empty response');
      }
      
      console.log('OpenAI response content:', content.substring(0, 100) + '...');
      
      // Try to extract JSON from text
      try {
        // Use regular expression to find JSON object
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const result = JSON.parse(jsonStr) as BenGrahamSignal;
          return result;
        }
        throw new Error('Unable to extract JSON from response');
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        // Return default value
        return {
          signal: "neutral",
          confidence: 0,
          reasoning: "Analysis generation error; defaulting to neutral."
        };
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      // Return default value
      return {
        signal: "neutral",
        confidence: 0,
        reasoning: "Error calling AI analysis service; defaulting to neutral."
      };
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    // Return default value
    return {
      signal: "neutral",
      confidence: 0,
      reasoning: "Error calling AI analysis service; defaulting to neutral."
    };
  }
} 