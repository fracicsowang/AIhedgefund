import { StockData, TradeRecommendation, PortfolioDecision } from '@/types';
import { riskAssessment } from './riskManager';

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