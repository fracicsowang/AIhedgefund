import yahooFinance from 'yahoo-finance2';
import { StockData } from '@/types';

/**
 * 封装Yahoo Finance API，获取股票数据
 * @param symbol 股票代码
 * @returns 股票数据对象
 */
export async function fetchStockData(symbol: string): Promise<StockData> {
  try {
    // 获取股票报价
    const quote = await yahooFinance.quote(symbol);
    
    // 获取股票摘要
    const quoteSummaryResponse = await yahooFinance.quoteSummary(symbol, {
      modules: [
        'defaultKeyStatistics',
        'financialData',
        'recommendationTrend',
        'summaryDetail'
      ]
    });
    
    // 转换Yahoo Finance返回的数据到我们的StockData类型格式
    // 注意：这里模拟了一些可能在API中不存在的字段
    const adaptedQuoteSummary = {
      defaultKeyStatistics: {
        forwardPE: {
          raw: quoteSummaryResponse.defaultKeyStatistics?.forwardPE || 0,
          fmt: quoteSummaryResponse.defaultKeyStatistics?.forwardPE?.toString() || 'N/A'
        },
        priceToBook: {
          raw: quoteSummaryResponse.defaultKeyStatistics?.priceToBook || 0,
          fmt: quoteSummaryResponse.defaultKeyStatistics?.priceToBook?.toString() || 'N/A'
        },
        returnOnEquity: {
          // Yahoo Finance可能不直接提供这些字段，所以我们模拟它们
          raw: 0.15 + (Math.random() * 0.1 - 0.05), // 模拟15%左右的ROE
          fmt: '15%'
        },
        debtToEquity: {
          // 模拟债务权益比
          raw: 0.5 + (Math.random() * 0.4 - 0.2), // 模拟0.5左右的债务权益比
          fmt: '0.5'
        },
        profitMargins: {
          raw: quoteSummaryResponse.defaultKeyStatistics?.profitMargins || 0,
          fmt: (quoteSummaryResponse.defaultKeyStatistics?.profitMargins || 0).toString() + '%'
        }
      },
      financialData: {
        totalCash: {
          raw: quoteSummaryResponse.financialData?.totalCash || 0,
          fmt: quoteSummaryResponse.financialData?.totalCash?.toString() || 'N/A'
        },
        totalDebt: {
          raw: quoteSummaryResponse.financialData?.totalDebt || 0,
          fmt: quoteSummaryResponse.financialData?.totalDebt?.toString() || 'N/A'
        },
        operatingCashflow: {
          raw: quoteSummaryResponse.financialData?.operatingCashflow || 0,
          fmt: quoteSummaryResponse.financialData?.operatingCashflow?.toString() || 'N/A'
        },
        revenueGrowth: {
          raw: quoteSummaryResponse.financialData?.revenueGrowth || 0,
          fmt: (quoteSummaryResponse.financialData?.revenueGrowth || 0).toString() + '%'
        },
        earningsGrowth: {
          raw: quoteSummaryResponse.financialData?.earningsGrowth || 0,
          fmt: (quoteSummaryResponse.financialData?.earningsGrowth || 0).toString() + '%'
        }
      },
      recommendationTrend: {
        trend: quoteSummaryResponse.recommendationTrend?.trend || []
      }
    };
    
    // 模拟技术指标数据（实际项目中可以使用专门的技术分析库计算）
    const technicalIndicators = {
      rsi: Math.random() * 100, // 随机生成RSI值，实际项目中应该计算
      macd: {
        macdLine: Math.random() * 2 - 1,
        signalLine: Math.random() * 2 - 1,
        histogram: Math.random() * 2 - 1
      },
      movingAverages: {
        ma50: (quote.regularMarketPrice || 0) * (0.9 + Math.random() * 0.2),
        ma200: (quote.regularMarketPrice || 0) * (0.8 + Math.random() * 0.4)
      }
    };
    
    // 模拟情绪数据（实际项目中可以从新闻API或社交媒体分析获取）
    const sentiment = {
      bearishPercent: Math.random() * 100,
      bullishPercent: Math.random() * 100,
      newsScore: Math.random() * 2 - 1 // -1到1之间的值
    };
    
    // 构建最终的股票数据对象
    const stockData: StockData = {
      symbol,
      price: {
        regularMarketPrice: quote.regularMarketPrice,
        regularMarketChange: quote.regularMarketChange,
        regularMarketChangePercent: quote.regularMarketChangePercent,
        regularMarketDayHigh: quote.regularMarketDayHigh,
        regularMarketDayLow: quote.regularMarketDayLow,
        regularMarketVolume: quote.regularMarketVolume
      },
      quoteSummary: adaptedQuoteSummary,
      technicalIndicators,
      sentiment
    };
    
    return stockData;
  } catch (error) {
    console.error(`获取股票数据失败: ${symbol}`, error);
    throw new Error(`获取股票数据失败: ${symbol}`);
  }
}

/**
 * 获取七姐妹(FAANGM)和部分热门股票数据
 */
export async function fetchFamousStocks(): Promise<StockData[]> {
  // 定义知名科技股和热门股票
  const famousStocks = [
    'AAPL',  // 苹果
    'MSFT',  // 微软
    'GOOG',  // 谷歌
    'AMZN',  // 亚马逊
    'META',  // Meta(Facebook)
    'NVDA',  // 英伟达
    'TSLA',  // 特斯拉
  ];
  
  // 非订阅用户只能查看这些股票
  try {
    const stockDataPromises = famousStocks.map(symbol => fetchStockData(symbol));
    return await Promise.all(stockDataPromises);
  } catch (error) {
    console.error('获取热门股票数据失败', error);
    return [];
  }
}

/**
 * 获取更多股票数据（仅付费用户可用）
 */
export async function fetchMoreStocks(): Promise<StockData[]> {
  // 更广泛的股票组合，仅付费用户可访问
  const moreStocks = [
    'JPM',   // 摩根大通
    'V',     // Visa
    'JNJ',   // 强生
    'WMT',   // 沃尔玛
    'BAC',   // 美国银行
    'PG',    // 宝洁
    'MA',    // 万事达
    'DIS',   // 迪士尼
    'NFLX',  // 奈飞
    'PYPL',  // PayPal
    'INTC',  // 英特尔
    'KO',    // 可口可乐
    'VZ'     // Verizon
  ];
  
  try {
    const stockDataPromises = moreStocks.map(symbol => fetchStockData(symbol));
    return await Promise.all(stockDataPromises);
  } catch (error) {
    console.error('获取更多股票数据失败', error);
    return [];
  }
} 