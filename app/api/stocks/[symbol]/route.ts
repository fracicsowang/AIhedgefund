import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  // 确保params.symbol是有效的
  const symbol = params && params.symbol ? params.symbol.toUpperCase() : '';

  if (!symbol) {
    return NextResponse.json({ error: '股票代码不能为空' }, { status: 400 });
  }

  try {
    console.log(`开始查询股票数据: ${symbol}`);
    
    // 1. 获取股票报价数据
    const quote = await yahooFinance.quote(symbol);
    
    // 2. 获取股票摘要数据
    const quoteSummary = await yahooFinance.quoteSummary(symbol, {
      modules: ['price', 'defaultKeyStatistics', 'financialData', 'balanceSheetHistory']
    });

    // 3. 构建返回数据（扁平化关键财务字段）
    const stockData = {
      symbol: symbol,
      price: quote,
      marketCap: quote.marketCap || quoteSummary.price?.marketCap || null,
      earningsPerShare: quoteSummary.defaultKeyStatistics?.trailingEps || null,
      currentRatio: quoteSummary.financialData?.currentRatio || null,
      debtToEquity: quoteSummary.financialData?.debtToEquity || null,
      bookValuePerShare: quoteSummary.defaultKeyStatistics?.bookValue || null,
      sharesOutstanding: quoteSummary.defaultKeyStatistics?.sharesOutstanding || null,
      quoteSummary: quoteSummary
    };

    // Log processed stockData
    console.log('[API Route /api/stocks/[symbol]] Processed stockData:', JSON.stringify(stockData, null, 2));

    return NextResponse.json(stockData);

  } catch (error: any) {
    console.error(`获取${symbol}数据时出错:`, error);
    
    if (error.name === 'SymbolError' || error.message?.includes('not found')) {
      return NextResponse.json({ error: `未找到股票代码：${symbol}` }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: `获取${symbol}股票数据时发生错误: ${error.message || '未知错误'}` }, 
      { status: 500 }
    );
  }
} 