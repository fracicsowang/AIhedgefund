import { StockData, TradeRecommendation, PortfolioDecision } from '@/types';
import { riskAssessment } from './riskManager';
import { OpenAI } from 'openai';

/**
 * 投资组合管理器
 * 整合所有Agent的建议，综合分析给出最终决策
 */
export function makePortfolioDecision(
  stockData: StockData,
  agentDecisions: TradeRecommendation[]
): PortfolioDecision {
  // 获取风险评估
  const risk = riskAssessment(stockData, agentDecisions);
  
  // 统计各种决策的数量和置信度
  const buyCount = agentDecisions.filter(d => d.decision === 'BUY').length;
  const sellCount = agentDecisions.filter(d => d.decision === 'SELL').length;
  const holdCount = agentDecisions.filter(d => d.decision === 'HOLD').length;
  
  const totalAgents = agentDecisions.length;
  const buyConfidence = totalAgents > 0 ? buyCount / totalAgents : 0;
  const sellConfidence = totalAgents > 0 ? sellCount / totalAgents : 0;
  
  // 确定最终决策
  let finalDecision: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let confidence = 0;
  let reasoning = '';
  
  if (buyCount > sellCount && buyCount > holdCount) {
    finalDecision = 'BUY';
    confidence = buyConfidence;
    reasoning = `${buyCount}位投资大师建议买入，占比${(buyConfidence * 100).toFixed(0)}%`;
    
    // 高风险情况下降低买入信心
    if (risk.riskScore > 70) {
      reasoning += '，但风险评分较高，建议谨慎操作';
      confidence *= 0.8; // 降低置信度
    }
  } else if (sellCount > buyCount && sellCount > holdCount) {
    finalDecision = 'SELL';
    confidence = sellConfidence;
    reasoning = `${sellCount}位投资大师建议卖出，占比${(sellConfidence * 100).toFixed(0)}%`;
  } else {
    finalDecision = 'HOLD';
    confidence = 1 - (buyConfidence + sellConfidence);
    reasoning = `多数投资大师建议观望或意见不一致，建议持有`;
  }
  
  // 添加风险评估信息
  reasoning += `。风险评估：${risk.riskAssessment}`;
  if (risk.stopLossPrice && finalDecision === 'BUY') {
    reasoning += ` 建议止损价格：$${risk.stopLossPrice.toFixed(2)}`;
  }
  
  // 生成基本面分析
  const fundamentals = generateFundamentalsAnalysis(stockData);
  
  // 生成情绪分析
  const sentiment = generateSentimentAnalysis(stockData);
  
  // 生成技术面分析
  const technicals = generateTechnicalsAnalysis(stockData);
  
  return {
    symbol: stockData.symbol,
    finalDecision,
    confidence,
    reasoning,
    agentDecisions,
    fundamentals,
    sentiment,
    technicals
  };
}

// 生成基本面分析
function generateFundamentalsAnalysis(stockData: StockData) {
  const peRatio = stockData.quoteSummary?.defaultKeyStatistics?.forwardPE?.raw || 0;
  const roe = stockData.quoteSummary?.defaultKeyStatistics?.returnOnEquity?.raw || 0;
  const revenueGrowth = stockData.quoteSummary?.financialData?.revenueGrowth?.raw || 0;
  const debtToEquity = stockData.quoteSummary?.defaultKeyStatistics?.debtToEquity?.raw || 0;
  
  return {
    valuation: peRatio < 15 ? '估值偏低' : peRatio < 25 ? '估值适中' : '估值偏高',
    growth: revenueGrowth > 0.15 ? '高增长' : revenueGrowth > 0.05 ? '适中增长' : '低增长',
    profitability: roe > 0.15 ? '高盈利能力' : roe > 0.08 ? '适中盈利能力' : '低盈利能力',
    financialHealth: debtToEquity < 0.3 ? '财务健康' : debtToEquity < 0.7 ? '财务适中' : '财务负担重'
  };
}

// 生成情绪分析
function generateSentimentAnalysis(stockData: StockData) {
  // 分析师评级
  const trend = stockData.quoteSummary?.recommendationTrend?.trend?.[0];
  const strongBuy = trend?.strongBuy || 0;
  const buy = trend?.buy || 0;
  const hold = trend?.hold || 0;
  const sell = trend?.sell || 0;
  const strongSell = trend?.strongSell || 0;
  
  const totalRatings = strongBuy + buy + hold + sell + strongSell;
  const buyRatio = totalRatings > 0 ? (strongBuy + buy) / totalRatings : 0;
  const sellRatio = totalRatings > 0 ? (sell + strongSell) / totalRatings : 0;
  
  let analystRating = '无分析师评级';
  if (totalRatings > 0) {
    if (buyRatio > 0.7) {
      analystRating = '强烈看好';
    } else if (buyRatio > 0.5) {
      analystRating = '看好';
    } else if (sellRatio > 0.7) {
      analystRating = '强烈看空';
    } else if (sellRatio > 0.5) {
      analystRating = '看空';
    } else {
      analystRating = '中性';
    }
  }
  
  // 新闻情绪
  const newsScore = stockData.sentiment?.newsScore || 0;
  let newsSentiment = '中性';
  if (newsScore > 0.3) {
    newsSentiment = '积极';
  } else if (newsScore < -0.3) {
    newsSentiment = '消极';
  }
  
  // 机构持股比例分析 (这里是模拟数据，实际应从stockData获取)
  const institutionalHoldings = '中等机构参与度';
  
  return {
    analystRating,
    newsSentiment,
    institutionalHoldings
  };
}

// 生成技术面分析
function generateTechnicalsAnalysis(stockData: StockData) {
  // RSI分析
  const rsi = stockData.technicalIndicators?.rsi || 50;
  let momentum = '中性';
  if (rsi > 70) {
    momentum = '超买';
  } else if (rsi < 30) {
    momentum = '超卖';
  }
  
  // 均线分析
  const ma50 = stockData.technicalIndicators?.movingAverages?.ma50;
  const ma200 = stockData.technicalIndicators?.movingAverages?.ma200;
  const price = stockData.price?.regularMarketPrice || 0;
  
  let trend = '中性';
  if (ma50 && ma200 && price) {
    if (price > ma50 && ma50 > ma200) {
      trend = '强劲上升';
    } else if (price < ma50 && ma50 < ma200) {
      trend = '强劲下降';
    } else if (price > ma50) {
      trend = '短期上升';
    } else if (price < ma50) {
      trend = '短期下降';
    }
  }
  
  // 波动性分析
  const dayHigh = stockData.price?.regularMarketDayHigh || 0;
  const dayLow = stockData.price?.regularMarketDayLow || 0;
  let volatility = '中等波动';
  
  if (price) {
    const dailyRange = (dayHigh - dayLow) / price;
    if (dailyRange > 0.05) {
      volatility = '高波动';
    } else if (dailyRange < 0.01) {
      volatility = '低波动';
    }
  }
  
  return {
    trend,
    momentum,
    volatility
  };
}

// --- 数据结构定义 ---
export type PortfolioDecisionAction = 'buy' | 'sell' | 'short' | 'cover' | 'hold';

export interface PortfolioManagerOutput {
  decisions: Record<string, import('@/types').PortfolioDecision>; // ticker -> decision
}

export interface PortfolioManagerAgentInput {
  portfolio: {
    cash: number;
    holdings: { ticker: string; shares: number; cost_basis: number }[];
    positions?: Record<string, number>; // 可选，long/short 持仓
    margin_requirement?: number;
    margin_used?: number;
  };
  analystSignals: Record<string, any>; // 各 agent 的信号，含 risk_manager
  tickers: string[];
  apiKey: string;
  modelName?: string;
  modelProvider?: string;
}

// --- 主体函数骨架 ---
export async function portfolioManagerAgent({
  portfolio,
  analystSignals,
  tickers,
  apiKey,
  modelName = 'gpt-3.5-turbo',
  modelProvider = 'openai',
}: PortfolioManagerAgentInput): Promise<PortfolioManagerOutput> {
  // 1. 整理风控数据、最大可买/可卖股数、所有 agent 信号
  const positionLimits: Record<string, number> = {};
  const currentPrices: Record<string, number> = {};
  const maxShares: Record<string, number> = {};
  const signalsByTicker: Record<string, any> = {};
  for (const ticker of tickers) {
    const riskData = analystSignals?.risk_manager?.[ticker] || {};
    positionLimits[ticker] = riskData.remaining_position_limit || 0;
    currentPrices[ticker] = riskData.current_price || 0;
    maxShares[ticker] = currentPrices[ticker] > 0 ? Math.floor(positionLimits[ticker] / currentPrices[ticker]) : 0;
    // 整理所有 agent 信号
    const tickerSignals: Record<string, any> = {};
    for (const agent in analystSignals) {
      if (agent !== 'risk_manager' && analystSignals[agent]?.[ticker]) {
        tickerSignals[agent] = {
          signal: analystSignals[agent][ticker].signal,
          confidence: analystSignals[agent][ticker].confidence,
        };
      }
    }
    signalsByTicker[ticker] = tickerSignals;
  }

  // 2. 组装 LLM prompt
  const systemPrompt = `You are a portfolio manager making final trading decisions based on multiple tickers.\n\nTrading Rules:\n- For long positions:\n  * Only buy if you have available cash\n  * Only sell if you currently hold long shares of that ticker\n  * Sell quantity must be ≤ current long position shares\n  * Buy quantity must be ≤ max_shares for that ticker\n- For short positions:\n  * Only short if you have available margin (position value × margin requirement)\n  * Only cover if you currently have short shares of that ticker\n  * Cover quantity must be ≤ current short position shares\n  * Short quantity must respect margin requirements\n- The max_shares values are pre-calculated to respect position limits\n- Consider both long and short opportunities based on signals\n- Maintain appropriate risk management with both long and short exposure\n\nAvailable Actions:\n- \"buy\": Open or add to long position\n- \"sell\": Close or reduce long position\n- \"short\": Open or add to short position\n- \"cover\": Close or reduce short position\n- \"hold\": No action\n\nInputs:\n- signals_by_ticker: dictionary of ticker → signals\n- max_shares: maximum shares allowed per ticker\n- portfolio_cash: current cash in portfolio\n- portfolio_positions: current positions (both long and short)\n- current_prices: current prices for each ticker\n- margin_requirement: current margin requirement for short positions (e.g., 0.5 means 50%)\n- total_margin_used: total margin currently in use`;

  const userPrompt = `Based on the team's analysis, make your trading decisions for each ticker.\n\nHere are the signals by ticker:\n${JSON.stringify(signalsByTicker, null, 2)}\n\nCurrent Prices:\n${JSON.stringify(currentPrices, null, 2)}\n\nMaximum Shares Allowed For Purchases:\n${JSON.stringify(maxShares, null, 2)}\n\nPortfolio Cash: ${portfolio.cash}\nCurrent Positions: ${JSON.stringify(portfolio.positions || {}, null, 2)}\nCurrent Margin Requirement: ${portfolio.margin_requirement || 0.5}\nTotal Margin Used: ${portfolio.margin_used || 0}\n\nOutput strictly in JSON with the following structure:\n{\n  \"decisions\": {\n    \"TICKER1\": {\n      \"action\": \"buy/sell/short/cover/hold\",\n      \"quantity\": integer,\n      \"confidence\": float between 0 and 100,\n      \"reasoning\": \"string\"\n    },\n    \"TICKER2\": { ... },\n    ...\n  }\n}`;

  // 3. 调用 OpenAI
  const realApiKey = apiKey || process.env.OPENAI_API_KEY;
  if (!realApiKey) throw new Error('OpenAI API key not found.');
  const openai = new OpenAI({ apiKey: realApiKey });

  // ====== 新增详细调试日志 ======
  console.log('[PortfolioManager] systemPrompt:', systemPrompt);
  console.log('[PortfolioManager] userPrompt:', userPrompt);
  console.log('[PortfolioManager] Using OpenAI key:', realApiKey.slice(0, 10));
  try {
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 1000
    });
    const content = response.choices[0].message.content;
    console.log('[PortfolioManager] OpenAI response:', content);
    if (!content) throw new Error('Empty response from OpenAI');
    // 解析JSON，清理控制字符
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const cleanJson = jsonMatch[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      try {
        const result = JSON.parse(cleanJson) as { decisions: Record<string, any> };
        // === 结构转换：补全 PortfolioDecision 类型 ===
        const output: PortfolioManagerOutput = { decisions: {} };
        for (const ticker of tickers) {
          const llmDecision = result.decisions[ticker] || {};
          // action 映射
          let finalDecision: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
          if (llmDecision.action) {
            const actionStr = String(llmDecision.action).toUpperCase();
            if (actionStr === 'BUY') finalDecision = 'BUY';
            else if (actionStr === 'SELL') finalDecision = 'SELL';
            else finalDecision = 'HOLD'; // short/cover/hold等都归为HOLD
          }
          output.decisions[ticker] = {
            symbol: ticker,
            finalDecision,
            confidence: llmDecision.confidence || 0,
            reasoning: llmDecision.reasoning || 'No reasoning provided.',
            agentDecisions: [], // 可后续补充各 agent 信号
            fundamentals: {
              valuation: '',
              growth: '',
              profitability: '',
              financialHealth: ''
            },
            sentiment: {
              analystRating: '',
              newsSentiment: '',
              institutionalHoldings: ''
            },
            technicals: {
              trend: '',
              momentum: '',
              volatility: ''
            },
            // 新增，保留 LLM 原始 action/quantity
            action: llmDecision.action || 'hold',
            quantity: llmDecision.quantity ?? 0,
          };
        }
        return output;
      } catch (parseError) {
        console.error('[PortfolioManager] JSON parse error:', parseError, '\n原始内容:', cleanJson);
        throw parseError;
      }
    }
    throw new Error('Unable to extract JSON from response');
  } catch (error) {
    console.error('[PortfolioManager] OpenAI 调用异常:', error);
    // 兜底：所有 ticker 默认 hold
    const fallback: PortfolioManagerOutput = { decisions: {} };
    for (const ticker of tickers) {
      fallback.decisions[ticker] = {
        symbol: ticker,
        finalDecision: 'HOLD',
        confidence: 0,
        reasoning: 'Error in portfolio management, defaulting to hold.',
        agentDecisions: [],
        fundamentals: {
          valuation: '',
          growth: '',
          profitability: '',
          financialHealth: ''
        },
        sentiment: {
          analystRating: '',
          newsSentiment: '',
          institutionalHoldings: ''
        },
        technicals: {
          trend: '',
          momentum: '',
          volatility: ''
        },
        action: 'hold',
        quantity: 0,
      };
    }
    return fallback;
  }
} 