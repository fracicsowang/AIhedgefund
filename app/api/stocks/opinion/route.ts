import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { StockData } from '@/types';

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { stockData } = body as { stockData: StockData };
    
    if (!stockData) {
      return NextResponse.json(
        { error: '缺少股票数据' },
        { status: 400 }
      );
    }

    // 准备发送给ChatGPT的提示
    const prompt = generatePrompt(stockData);
    
    // 调用OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: '你是一位经验丰富的股票分析师，擅长分析股票数据并给出专业的建议。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    // 获取生成的意见
    const opinion = response.choices[0]?.message?.content || '无法生成分析意见';
    
    return NextResponse.json({ opinion });
    
  } catch (error: any) {
    console.error('生成股票分析意见时出错:', error);
    return NextResponse.json(
      { error: '生成分析意见失败', message: error.message },
      { status: 500 }
    );
  }
}

// 生成提示
function generatePrompt(stockData: StockData): string {
  const { symbol, quoteSummary, price } = stockData;
  
  return `
请你分析以下股票数据，并给出专业的股票分析意见：

股票代码: ${symbol}
公司名称: ${quoteSummary?.longName || 'N/A'}
当前价格: $${price?.regularMarketPrice?.toFixed(2) || 'N/A'}
涨跌幅: ${price?.regularMarketChangePercent?.toFixed(2) || 'N/A'}%
52周最高: $${quoteSummary?.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'}
52周最低: $${quoteSummary?.fiftyTwoWeekLow?.toFixed(2) || 'N/A'}
市值: ${formatMarketCap(quoteSummary?.marketCap)}
市盈率(TTM): ${quoteSummary?.trailingPE?.toFixed(2) || 'N/A'}
每股收益(TTM): $${quoteSummary?.epsTrailingTwelveMonths?.toFixed(2) || 'N/A'}
每股净资产: $${quoteSummary?.bookValue?.toFixed(2) || 'N/A'}
股息收益率: ${(quoteSummary?.dividendYield || 0) * 100}%

请分析这支股票的基本面、技术面和风险情况，并提供以下内容：
1. 基本面分析（公司基本情况、财务状况）
2. 技术面分析（价格趋势、支撑阻力位）
3. 风险分析（市场风险、行业风险、公司特定风险）
4. 投资建议（适合哪类投资者，短期和长期展望）
5. 总结（给出买入、卖出或持有的建议）

请以专业股票分析师的角度回答，避免过于笼统的建议。
`;
}

// 格式化市值
function formatMarketCap(marketCap?: number): string {
  if (!marketCap) return 'N/A';
  
  if (marketCap >= 1e12) {
    return `${(marketCap / 1e12).toFixed(2)}万亿`;
  } else if (marketCap >= 1e9) {
    return `${(marketCap / 1e9).toFixed(2)}十亿`;
  } else if (marketCap >= 1e6) {
    return `${(marketCap / 1e6).toFixed(2)}百万`;
  } else {
    return marketCap.toString();
  }
} 