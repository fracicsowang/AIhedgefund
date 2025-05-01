import { StockData } from '@/types';

/**
 * Warren Buffett策略 - 价值投资者
 * 关注有竞争优势、管理良好、长期商业模式的公司
 */
export function warrenBuffettStrategy(stockData: StockData): {
  decision: 'BUY' | 'SELL' | 'HOLD';
  reasoning: string;
} {
  // Buffett关注的指标：ROE、利润率、负债率、现金流
  const roe = stockData.quoteSummary?.defaultKeyStatistics?.returnOnEquity?.raw || 0;
  const profitMargin = stockData.quoteSummary?.defaultKeyStatistics?.profitMargins?.raw || 0;
  const debtToEquity = stockData.quoteSummary?.defaultKeyStatistics?.debtToEquity?.raw || 0;
  const operatingCashflow = stockData.quoteSummary?.financialData?.operatingCashflow?.raw || 0;
  
  let positiveFactors = 0;
  let reasoning = "巴菲特投资分析：\n";
  
  if (roe > 0.15) {
    positiveFactors++;
    reasoning += "✓ 股本回报率(ROE)为" + (roe * 100).toFixed(2) + "%，高于15%的标准\n";
  } else {
    reasoning += "✗ 股本回报率(ROE)为" + (roe * 100).toFixed(2) + "%，低于15%的理想值\n";
  }
  
  if (profitMargin > 0.10) {
    positiveFactors++;
    reasoning += "✓ 利润率为" + (profitMargin * 100).toFixed(2) + "%，表明良好的盈利能力\n";
  } else {
    reasoning += "✗ 利润率为" + (profitMargin * 100).toFixed(2) + "%，盈利能力有限\n";
  }
  
  if (debtToEquity < 0.5) {
    positiveFactors++;
    reasoning += "✓ 负债权益比为" + debtToEquity.toFixed(2) + "，负债水平合理\n";
  } else {
    reasoning += "✗ 负债权益比为" + debtToEquity.toFixed(2) + "，负债水平偏高\n";
  }
  
  if (operatingCashflow > 0) {
    positiveFactors++;
    reasoning += "✓ 经营现金流为正，表明业务健康\n";
  } else {
    reasoning += "✗ 经营现金流为负，现金流存在问题\n";
  }
  
  if (positiveFactors >= 3) {
    return {
      decision: 'BUY',
      reasoning: reasoning + "\n总结：该股票符合巴菲特投资标准，具备良好的商业特性。"
    };
  } else if (positiveFactors >= 2) {
    return {
      decision: 'HOLD',
      reasoning: reasoning + "\n总结：该股票部分符合巴菲特投资标准，建议持观望态度。"
    };
  } else {
    return {
      decision: 'SELL',
      reasoning: reasoning + "\n总结：该股票不符合巴菲特投资标准，不建议投资。"
    };
  }
} 