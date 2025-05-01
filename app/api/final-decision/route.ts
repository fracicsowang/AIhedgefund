import { NextRequest, NextResponse } from 'next/server';
import { fetchStockData } from '@/lib/fetchStockData';
import { benGrahamStrategy } from '@/agents/benGraham';
import { warrenBuffettStrategy } from '@/agents/warrenBuffett';
import { makePortfolioDecision } from '@/agents/portfolioManager';
import { TradeRecommendation } from '@/types';
import { getCurrentUser, getUserSubscription } from '@/lib/supabase';

// 投资Agent映射表
const AGENTS: Record<string, (stockData: any) => { decision: 'BUY' | 'SELL' | 'HOLD', reasoning: string }> = {
  'benGraham': benGrahamStrategy,
  'warrenBuffett': warrenBuffettStrategy,
  // 后续可以添加更多投资大师
};

export async function GET(request: NextRequest) {
  try {
    // 获取symbol参数
    const symbol = request.nextUrl.searchParams.get('symbol');
    
    if (!symbol) {
      return NextResponse.json(
        { error: '缺少必要参数: symbol' },
        { status: 400 }
      );
    }
    
    // 获取当前用户（如果已登录）
    const user = await getCurrentUser();
    let includeAllAgents = false;
    
    // 检查用户订阅状态
    if (user) {
      const subscription = await getUserSubscription(user.id);
      
      // 定义免费用户可访问的股票列表
      const freeStocks = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'META', 'NVDA', 'TSLA'];
      
      // 如果是免费用户但尝试访问付费股票
      if (
        subscription.subscription_status === 'free' && 
        !freeStocks.includes(symbol.toUpperCase())
      ) {
        return NextResponse.json(
          { error: '需要订阅才能查看此股票的数据' },
          { status: 403 }
        );
      }
      
      // 确定要包含的投资大师
      includeAllAgents = subscription.subscription_status !== 'free';
    }
    
    // 获取股票数据
    const stockData = await fetchStockData(symbol);
    
    // 获取每个投资大师的决策
    const agentsToInclude = includeAllAgents ? Object.keys(AGENTS) : ['benGraham'];
    const agentDecisions: TradeRecommendation[] = [];
    
    for (const agentName of agentsToInclude) {
      const strategy = AGENTS[agentName];
      const { decision, reasoning } = strategy(stockData);
      
      agentDecisions.push({
        symbol: symbol.toUpperCase(),
        agentName,
        decision,
        reasoning,
        confidence: calculateConfidence(decision, reasoning),
        timestamp: new Date().toISOString()
      });
    }
    
    // 使用投资组合管理器生成最终决策
    const portfolioDecision = makePortfolioDecision(stockData, agentDecisions);
    
    return NextResponse.json(portfolioDecision);
  } catch (error) {
    console.error('获取投资决策失败:', error);
    return NextResponse.json(
      { error: '获取投资决策失败' },
      { status: 500 }
    );
  }
}

// 简单的置信度计算函数
function calculateConfidence(decision: 'BUY' | 'SELL' | 'HOLD', reasoning: string): number {
  // 分析推理中的确定性词汇来估计置信度
  const highConfidenceTerms = ['明显', '强烈', '显著', '非常', '极其', '明确'];
  const lowConfidenceTerms = ['可能', '或许', '也许', '不确定', '不明确'];
  
  let confidence = 0.7; // 默认置信度
  
  // 根据决策类型调整基础置信度
  if (decision === 'HOLD') {
    confidence = 0.5; // 持有通常表示不那么确定
  }
  
  // 根据推理文本中的确定性词汇调整置信度
  const reasoningLower = reasoning.toLowerCase();
  highConfidenceTerms.forEach(term => {
    if (reasoningLower.includes(term)) confidence += 0.05;
  });
  
  lowConfidenceTerms.forEach(term => {
    if (reasoningLower.includes(term)) confidence -= 0.1;
  });
  
  // 确保置信度在0-1范围内
  return Math.max(0.1, Math.min(0.95, confidence));
} 