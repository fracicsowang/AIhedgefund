import { StockData } from '@/types';
import OpenAI from 'openai';

/**
 * Ben Graham信号类型
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
}

interface GrahamAnalysisResult {
  score: number;
  details: string;
}

/**
 * Ben Graham策略 - 价值投资之父
 * 关注安全边际，寻找被低估的股票
 */
export async function benGrahamStrategy(stockData: StockData): Promise<{
  decision: SignalType;
  reasoning: string;
}> {
  try {
    // 提取基本财务指标
    const metrics = extractFinancialMetrics(stockData);
    
    // 分析盈利稳定性
    const earningsAnalysis = analyzeEarningsStability(metrics);
    
    // 分析财务实力
    const strengthAnalysis = analyzeFinancialStrength(metrics);
    
    // 分析价值评估
    const marketCap = calculateMarketCap(stockData);
    const valuationAnalysis = analyzeValuationGraham(metrics, marketCap);
    
    // 计算总分
    const totalScore = earningsAnalysis.score + strengthAnalysis.score + valuationAnalysis.score;
    const maxPossibleScore = 15; // 所有分析函数的总可能分数
    
    // 生成详细分析结果
    const analysisData = {
      signal: mapScoreToSignal(totalScore, maxPossibleScore),
      score: totalScore,
      max_score: maxPossibleScore,
      earnings_analysis: earningsAnalysis,
      strength_analysis: strengthAnalysis,
      valuation_analysis: valuationAnalysis
    };
    
    // 打印调试信息
    console.log(`Graham分析 - 股票代码: ${stockData.symbol}, 总分: ${totalScore}/${maxPossibleScore}`);
    const apiKey = process.env.OPENAI_API_KEY || '';
    // 处理可能的换行符
    const cleanApiKey = apiKey.replace(/\r?\n/g, '');
    
    console.log(`OpenAI API密钥状态: ${cleanApiKey ? `已设置 (前10个字符: ${cleanApiKey.substring(0, 10)}...)` : '未设置'}`);
    console.log(`密钥长度: ${cleanApiKey.length} 字符`);
    
    // Modified: Always use basic algorithm regardless of API key
    console.log('使用基本算法分析 (跳过OpenAI调用)');
    return generateBasicDecision(analysisData);
    
    /* Original code commented out:
    // 尝试直接检查原始环境变量
    console.log('开始强制测试OpenAI API');
    
    // 如果有OpenAI API密钥，使用GPT生成更详细的分析
    if (cleanApiKey && cleanApiKey !== '您的OpenAI密钥') {
      console.log('尝试使用OpenAI进行分析...');
      try {
        // 为确保API密钥在调用时可用，直接将其传递给函数
        const grahamSignal = await generateGrahamOutput(stockData.symbol || '', analysisData, cleanApiKey);
        return mapGrahamSignalToDecision(grahamSignal);
      } catch (error) {
        console.error('OpenAI分析失败，回退到基本算法:', error);
        return generateBasicDecision(analysisData);
      }
    } else {
      console.log('使用基本算法分析 (未使用OpenAI)');
      // 如果没有OpenAI API密钥，使用基本逻辑生成决策
      return generateBasicDecision(analysisData);
    }
    */
  } catch (error) {
    console.error('BenGraham策略分析错误:', error);
    return {
      decision: 'HOLD',
      reasoning: '分析过程中发生错误，建议持有等待更多数据。'
    };
  }
}

/**
 * 计算股票市值
 */
function calculateMarketCap(stockData: StockData): number {
  // 如果有股票价格和流通股数，计算市值
  const price = stockData.price?.regularMarketPrice || 0;
  
  // 类型转换以访问可能缺失的属性
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
 * 从StockData中提取财务指标
 */
function extractFinancialMetrics(stockData: StockData): FinancialLineItem {
  // 添加额外的类型定义，以补充现有 StockData 类型中的缺失部分
  interface ExtendedKeyStatistics {
    forwardPE?: { raw?: number; fmt?: string };
    priceToBook?: { raw?: number; fmt?: string };
    trailingEPS?: { raw?: number; fmt?: string };
    bookValue?: { raw?: number; fmt?: string };
    sharesOutstanding?: { raw?: number; fmt?: string };
  }
  
  interface ExtendedFinancialData {
    totalCash?: { raw?: number; fmt?: string };
    totalDebt?: { raw?: number; fmt?: string };
    totalRevenue?: { raw?: number; fmt?: string };
    netIncome?: { raw?: number; fmt?: string };
    dividendRate?: { raw?: number; fmt?: string };
  }
  
  interface BalanceSheetStatement {
    totalAssets?: { raw?: number; fmt?: string };
    totalLiab?: { raw?: number; fmt?: string };
    totalCurrentAssets?: { raw?: number; fmt?: string };
    totalCurrentLiabilities?: { raw?: number; fmt?: string };
  }
  
  interface ExtendedQuoteSummary {
    longName?: string;
    defaultKeyStatistics?: ExtendedKeyStatistics;
    financialData?: ExtendedFinancialData;
    balanceSheetHistory?: {
      balanceSheetStatements?: BalanceSheetStatement[];
    };
  }
  
  const quoteData = stockData.quoteSummary as unknown as ExtendedQuoteSummary || {};
  const keyStats = quoteData.defaultKeyStatistics || {};
  const financials = quoteData.financialData || {};
  const balanceSheet = quoteData.balanceSheetHistory?.balanceSheetStatements?.[0] || {};
  
  return {
    earnings_per_share: keyStats.trailingEPS?.raw || 0,
    book_value_per_share: keyStats.bookValue?.raw || 0,
    total_assets: balanceSheet.totalAssets?.raw || 0,
    total_liabilities: balanceSheet.totalLiab?.raw || 0,
    current_assets: balanceSheet.totalCurrentAssets?.raw || 0,
    current_liabilities: balanceSheet.totalCurrentLiabilities?.raw || 0,
    outstanding_shares: keyStats.sharesOutstanding?.raw || 0,
    // 从股票数据中提取其他可能有用的指标
    revenue: financials.totalRevenue?.raw || 0,
    net_income: financials.netIncome?.raw || 0,
    dividends_and_other_cash_distributions: financials.dividendRate?.raw || 0
  };
}

/**
 * 分析盈利稳定性
 */
function analyzeEarningsStability(metrics: FinancialLineItem): GrahamAnalysisResult {
  let score = 0;
  const details: string[] = [];
  
  const eps = metrics.earnings_per_share || 0;
  
  // 基本EPS检查 - 在有限的数据情况下简化处理
  if (eps > 0) {
    score += 3;
    details.push(`每股收益为正 (${eps.toFixed(2)})，符合Graham标准。`);
  } else {
    details.push(`当前每股收益不为正 (${eps.toFixed(2)})，不符合Graham的盈利稳定性要求。`);
  }
  
  // 注意：理想情况下，我们应该有多年的EPS数据来分析趋势
  // 如果API提供了历史数据，可以进一步完善这一部分
  
  return { score, details: details.join(' ') };
}

/**
 * 分析财务实力
 */
function analyzeFinancialStrength(metrics: FinancialLineItem): GrahamAnalysisResult {
  let score = 0;
  const details: string[] = [];
  
  // 1. 流动比率分析
  const currentRatio = metrics.current_assets && metrics.current_liabilities && metrics.current_liabilities > 0
    ? metrics.current_assets / metrics.current_liabilities
    : 0;
    
  if (currentRatio >= 2.0) {
    score += 2;
    details.push(`流动比率 = ${currentRatio.toFixed(2)} (>=2.0: 良好)。`);
  } else if (currentRatio >= 1.5) {
    score += 1;
    details.push(`流动比率 = ${currentRatio.toFixed(2)} (中等强度)。`);
  } else if (currentRatio > 0) {
    details.push(`流动比率 = ${currentRatio.toFixed(2)} (<1.5: 流动性较弱)。`);
  } else {
    details.push(`无法计算流动比率 (缺少或零流动负债)。`);
  }
  
  // 2. 债务vs资产分析
  const totalAssets = metrics.total_assets || 0;
  const totalLiabilities = metrics.total_liabilities || 0;
  
  if (totalAssets > 0) {
    const debtRatio = totalLiabilities / totalAssets;
    if (debtRatio < 0.5) {
      score += 2;
      details.push(`债务比率 = ${debtRatio.toFixed(2)}，低于0.50 (保守)。`);
    } else if (debtRatio < 0.8) {
      score += 1;
      details.push(`债务比率 = ${debtRatio.toFixed(2)}，略高但可接受。`);
    } else {
      details.push(`债务比率 = ${debtRatio.toFixed(2)}，按Graham标准相当高。`);
    }
  } else {
    details.push(`无法计算债务比率 (缺少总资产数据)。`);
  }
  
  // 3. 股息记录
  const dividendRate = metrics.dividends_and_other_cash_distributions || 0;
  if (dividendRate > 0) {
    score += 1;
    details.push(`公司有支付股息 (${dividendRate.toFixed(2)})，增加了安全性。`);
  } else {
    details.push(`公司无股息支付或数据不可用。`);
  }
  
  return { score, details: details.join(' ') };
}

/**
 * 分析Graham价值评估
 */
function analyzeValuationGraham(metrics: FinancialLineItem, marketCap: number): GrahamAnalysisResult {
  let score = 0;
  const details: string[] = [];
  
  if (!marketCap || marketCap <= 0) {
    return { score: 0, details: "缺少市值数据，无法进行价值评估" };
  }
  
  const currentAssets = metrics.current_assets || 0;
  const totalLiabilities = metrics.total_liabilities || 0;
  const bookValuePS = metrics.book_value_per_share || 0;
  const eps = metrics.earnings_per_share || 0;
  const sharesOutstanding = metrics.outstanding_shares || 0;
  
  // 1. Net-Net 检查
  const netCurrentAssetValue = currentAssets - totalLiabilities;
  
  if (netCurrentAssetValue > 0 && sharesOutstanding > 0) {
    const netCurrentAssetValuePerShare = netCurrentAssetValue / sharesOutstanding;
    const pricePerShare = sharesOutstanding > 0 ? marketCap / sharesOutstanding : 0;
    
    details.push(`净流动资产价值 = ${netCurrentAssetValue.toLocaleString()} 元`);
    details.push(`每股净流动资产价值 = ${netCurrentAssetValuePerShare.toFixed(2)} 元`);
    details.push(`每股价格 = ${pricePerShare.toFixed(2)} 元`);
    
    if (netCurrentAssetValue > marketCap) {
      score += 4;
      details.push(`Net-Net: 净流动资产价值 > 市值 (classic Graham deep value)。`);
    } else if (netCurrentAssetValuePerShare >= (pricePerShare * 0.67)) {
      score += 2;
      details.push(`每股净流动资产价值 >= 每股价格的2/3 (中等 net-net 折扣)。`);
    }
  } else {
    details.push(`净流动资产价值未超过市值或数据不足，无法进行 net-net 分析。`);
  }
  
  // 2. Graham数字
  let grahamNumber = null;
  if (eps > 0 && bookValuePS > 0) {
    grahamNumber = Math.sqrt(22.5 * eps * bookValuePS);
    details.push(`Graham数字 = ${grahamNumber.toFixed(2)} 元`);
  } else {
    details.push(`无法计算Graham数字 (EPS或每股账面价值缺失/<=0)。`);
  }
  
  // 3. 相对于Graham数字的安全边际
  if (grahamNumber && sharesOutstanding > 0) {
    const currentPrice = marketCap / sharesOutstanding;
    if (currentPrice > 0) {
      const marginOfSafety = (grahamNumber - currentPrice) / currentPrice;
      details.push(`安全边际 (Graham数字) = ${(marginOfSafety * 100).toFixed(2)}%`);
      
      if (marginOfSafety > 0.5) {
        score += 3;
        details.push(`价格远低于Graham数字 (>=50% 边际)。`);
      } else if (marginOfSafety > 0.2) {
        score += 1;
        details.push(`相对于Graham数字有一定的安全边际。`);
      } else {
        details.push(`价格接近或高于Graham数字，安全边际较低。`);
      }
    } else {
      details.push(`当前价格为零或无效；无法计算安全边际。`);
    }
  }
  
  return { score, details: details.join(' ') };
}

/**
 * 将分数映射到投资信号
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
 * 将Graham信号映射到决策
 */
function mapGrahamSignalToDecision(signal: BenGrahamSignal): {
  decision: SignalType;
  reasoning: string;
} {
  const decisionMap: Record<GrahamSignalType, SignalType> = {
    "bullish": "BUY",
    "bearish": "SELL",
    "neutral": "HOLD"
  };
  
  return {
    decision: decisionMap[signal.signal],
    reasoning: `${signal.reasoning} (置信度: ${signal.confidence.toFixed(0)}%)`
  };
}

/**
 * 生成基本决策，不使用GPT
 */
function generateBasicDecision(analysisData: any): {
  decision: SignalType;
  reasoning: string;
} {
  const decisionMap: Record<GrahamSignalType, SignalType> = {
    "bullish": "BUY",
    "bearish": "SELL",
    "neutral": "HOLD"
  };
  
  const decision = decisionMap[analysisData.signal as GrahamSignalType];
  
  // 构建推理文本
  let reasoning = `Graham分析得分: ${analysisData.score}/${analysisData.max_score}。 `;
  
  // 添加各个分析的详情
  reasoning += `盈利稳定性: ${analysisData.earnings_analysis.details} `;
  reasoning += `财务实力: ${analysisData.strength_analysis.details} `;
  reasoning += `价值评估: ${analysisData.valuation_analysis.details}`;
  
  return { decision, reasoning };
}

/**
 * 使用OpenAI生成Graham风格的输出
 */
async function generateGrahamOutput(
  ticker: string,
  analysisData: any,
  apiKey: string
): Promise<BenGrahamSignal> {
  try {
    // 初始化OpenAI客户端
    // 处理可能包含的换行符
    apiKey = apiKey.replace(/\r?\n/g, '');
    
    console.log(`generateGrahamOutput: 使用传入的API密钥, 长度: ${apiKey.length}`);
    console.log(`OpenAI API密钥前10个字符: ${apiKey.substring(0, 10)}...`);
    
    if (!apiKey || apiKey === '您的OpenAI密钥') {
      console.error('OpenAI API密钥未设置或是占位符');
      throw new Error('OpenAI API密钥未正确配置');
    }
    
    // 硬编码测试 - 仅用于调试，请勿在生产环境中使用
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    console.log('OpenAI客户端已初始化，准备发送请求');
    
    // 准备系统提示
    const systemPrompt = `您是Benjamin Graham AI代理，使用他的原则进行投资决策：
    1. 坚持安全边际，买入低于内在价值的股票（使用Graham数字、net-net等）。
    2. 强调公司的财务实力（低杠杆、充足的流动资产）。
    3. 偏好多年稳定的收益。
    4. 考虑股息记录以增加安全性。
    5. 避免投机或高增长假设；专注于已证实的指标。
    
    在提供您的推理时，请通过以下方式进行彻底而具体的分析：
    1. 解释最影响您决策的关键估值指标（Graham数字、NCAV、P/E等）
    2. 突出具体的财务实力指标（流动比率、债务水平等）
    3. 参考随时间推移的收益稳定性或不稳定性
    4. 提供精确数字的定量证据
    5. 将当前指标与Graham的特定阈值进行比较（例如，"2.5的流动比率超过Graham的2.0的最低要求"）
    6. 在您的解释中使用Benjamin Graham的保守、分析性的语音和风格
    
    例如，如果看涨："该股票以35%的折扣交易于净流动资产价值，提供充足的安全边际。2.5的流动比率和0.3的债务权益比表明财务状况强劲..."
    例如，如果看跌："尽管收益一致，当前50美元的价格超过了我们计算的35美元的Graham数字，没有提供安全边际。此外，仅为1.2的流动比率低于Graham首选的2.0阈值..."
    
    返回理性建议：看涨、看跌或中性，以及置信度水平（0-100）和彻底的推理。`;
    
    // 准备用户提示
    const userPrompt = `基于以下分析，创建Graham风格的投资信号：

    ${ticker}的分析数据：
    ${JSON.stringify(analysisData, null, 2)}

    返回准确JSON格式：
    {
      "signal": "bullish" 或 "bearish" 或 "neutral",
      "confidence": float (0-100),
      "reasoning": "string"
    }`;
    
    // 调用OpenAI API
    try {
      console.log('开始调用OpenAI API...');
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // 可以根据需要更改为更新的模型
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2, // 低温度以获得更一致的结果
        max_tokens: 1000
      });
      
      console.log('OpenAI API调用成功，状态码:', response.id ? 'OK' : 'ERROR');
      
      // 解析响应
      const content = response.choices[0].message.content;
      if (!content) {
        console.error('OpenAI返回了空响应');
        throw new Error('OpenAI返回了空响应');
      }
      
      console.log('OpenAI 响应内容:', content.substring(0, 100) + '...');
      
      // 尝试从文本中提取JSON
      try {
        // 使用正则表达式查找JSON对象
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const result = JSON.parse(jsonStr) as BenGrahamSignal;
          return result;
        }
        throw new Error('无法从响应中提取JSON');
      } catch (error) {
        console.error('解析OpenAI响应时出错:', error);
        // 返回默认值
        return {
          signal: "neutral",
          confidence: 0,
          reasoning: "分析生成错误；默认为中性。"
        };
      }
    } catch (error) {
      console.error('调用OpenAI API时出错:', error);
      // 返回默认值
      return {
        signal: "neutral",
        confidence: 0,
        reasoning: "调用AI分析服务时出错；默认为中性。"
      };
    }
  } catch (error) {
    console.error('调用OpenAI API时出错:', error);
    // 返回默认值
    return {
      signal: "neutral",
      confidence: 0,
      reasoning: "调用AI分析服务时出错；默认为中性。"
    };
  }
} 