import { StockData, TradeRecommendation } from '@/types';

/**
 * 风险管理器
 * 基于多个agent的决策，评估风险并给出风险评分
 */
export function riskAssessment(
  stockData: StockData,
  agentDecisions: TradeRecommendation[]
): {
  riskScore: number;  // 0-100, 越高风险越大
  riskAssessment: string;
  stopLossPrice?: number;
} {
  // 计算买入和卖出决策的数量
  const buyDecisions = agentDecisions.filter(d => d.decision === 'BUY');
  const sellDecisions = agentDecisions.filter(d => d.decision === 'SELL');
  
  // 计算风险评分
  let riskScore = 50; // 默认中等风险
  
  // 基于经纪人决策调整风险
  riskScore -= (buyDecisions.length / agentDecisions.length) * 20;
  riskScore += (sellDecisions.length / agentDecisions.length) * 20;
  
  // 基于技术指标调整风险
  const rsi = stockData.technicalIndicators?.rsi || 50;
  if (rsi > 70) {
    riskScore += 15; // 超买状态，增加风险评分
  } else if (rsi < 30) {
    riskScore -= 10; // 超卖状态，降低风险评分
  }
  
  // 基于波动性调整风险
  const marketPrice = stockData.price?.regularMarketPrice || 0;
  const dayHigh = stockData.price?.regularMarketDayHigh || 0;
  const dayLow = stockData.price?.regularMarketDayLow || 0;
  
  if (dayHigh && dayLow && marketPrice) {
    const dailyVolatility = (dayHigh - dayLow) / marketPrice;
    if (dailyVolatility > 0.05) {
      riskScore += 15; // 高波动性，增加风险评分
    }
  }
  
  // 确保风险评分在0-100范围内
  riskScore = Math.max(0, Math.min(100, riskScore));
  
  // 根据风险评分生成风险评估
  let riskAssessment = '';
  if (riskScore < 30) {
    riskAssessment = '低风险：多数分析师看好，技术指标健康，波动性低。';
  } else if (riskScore < 60) {
    riskAssessment = '中等风险：分析意见分歧，技术指标中性，市场波动适中。';
  } else {
    riskAssessment = '高风险：多数分析师看空，技术指标疲软，波动性高。';
  }
  
  // 计算建议止损价（当前价格的5-15%，根据风险评分调整）
  const stopLossPercentage = 0.05 + (riskScore / 100) * 0.1;
  const stopLossPrice = marketPrice ? marketPrice * (1 - stopLossPercentage) : undefined;
  
  return {
    riskScore,
    riskAssessment,
    stopLossPrice
  };
} 