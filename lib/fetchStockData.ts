import yahooFinance from 'yahoo-finance2';
import { StockData } from '@/types';

/**
 * Wrapper for Yahoo Finance API to fetch stock data
 * @param symbol Stock symbol
 * @returns Stock data object
 */
export async function fetchStockData(symbol: string): Promise<StockData> {
  try {
    // Get stock quote
    const quote = await yahooFinance.quote(symbol);
    
    // Get stock summary
    const quoteSummaryResponse = await yahooFinance.quoteSummary(symbol, {
      modules: [
        'defaultKeyStatistics',
        'financialData',
        'recommendationTrend',
        'summaryDetail',
        'price'
      ]
    });
    
    // Convert Yahoo Finance response data to our StockData format
    const longName = quoteSummaryResponse.price?.longName || quoteSummaryResponse.price?.shortName || symbol;
    
    const adaptedQuoteSummary = {
      longName,
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
          raw: 0,
          fmt: 'N/A'
        },
        debtToEquity: {
          raw: 0,
          fmt: 'N/A'
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
    
    // Calculate actual technical indicators (simplified version)
    const technicalIndicators = {
      rsi: 50, // Simplified value, should use technical analysis library in real application
      macd: {
        macdLine: 0,
        signalLine: 0,
        histogram: 0
      },
      movingAverages: {
        ma50: quote.regularMarketPrice || 0,
        ma200: quote.regularMarketPrice || 0
      }
    };
    
    // Analyst sentiment data
    const sentiment = {
      bearishPercent: 50,
      bullishPercent: 50,
      newsScore: 0
    };
    
    if (quoteSummaryResponse.recommendationTrend?.trend && quoteSummaryResponse.recommendationTrend.trend.length > 0) {
      const trend = quoteSummaryResponse.recommendationTrend.trend[0];
      const total = (trend.buy || 0) + (trend.strongBuy || 0) + (trend.sell || 0) + (trend.strongSell || 0) + (trend.hold || 0);
      
      if (total > 0) {
        // Calculate bearish percentage (sell + strong sell)
        sentiment.bearishPercent = ((trend.sell || 0) + (trend.strongSell || 0)) / total * 100;
        
        // Calculate bullish percentage (buy + strong buy)
        sentiment.bullishPercent = ((trend.buy || 0) + (trend.strongBuy || 0)) / total * 100;
        
        // Calculate news sentiment score (-1 to 1)
        sentiment.newsScore = ((trend.buy || 0) + (trend.strongBuy || 0) - (trend.sell || 0) - (trend.strongSell || 0)) / total;
      }
    }
    
    // Build the final stock data object
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
    console.error(`Failed to fetch stock data: ${symbol}`, error);
    // Return minimized stock data object to avoid the entire request failing
    return {
      symbol,
      price: {
        regularMarketPrice: 0,
        regularMarketChange: 0,
        regularMarketChangePercent: 0
      },
      quoteSummary: {
        longName: symbol
      }
    } as StockData;
  }
}

// Simple in-memory cache implementation
const stockCache: { [key: string]: { data: StockData, timestamp: number } } = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache expiration

/**
 * Get stock data from cache
 */
function getStockFromCache(symbol: string): StockData | null {
  const cachedStock = stockCache[symbol];
  if (cachedStock && Date.now() - cachedStock.timestamp < CACHE_TTL) {
    console.log(`Using cached data: ${symbol}`);
    return cachedStock.data;
  }
  return null;
}

/**
 * Save stock data to cache
 */
function saveStockToCache(symbol: string, data: StockData): void {
  stockCache[symbol] = {
    data,
    timestamp: Date.now()
  };
}

/**
 * Fetch single stock data with caching
 */
export async function fetchStockDataWithCache(symbol: string): Promise<StockData> {
  try {
    // Check cache first
    const cachedStock = getStockFromCache(symbol);
    if (cachedStock) {
      return cachedStock;
    }
    
    // Cache miss, fetch from API
    const stockData = await fetchStockData(symbol);
    
    // Save to cache
    saveStockToCache(symbol, stockData);
    
    return stockData;
  } catch (error) {
    console.error(`Failed to fetch stock data (with cache): ${symbol}`, error);
    throw error;
  }
}

/**
 * Fetch popular stocks data (extended to 30 stocks)
 */
export async function fetchFamousStocks(): Promise<StockData[]> {
  // Define popular stocks (extended to 30)
  const famousStocks = [
    // US Tech Stocks
    'AAPL',  // Apple
    'MSFT',  // Microsoft
    'GOOG',  // Google
    'AMZN',  // Amazon
    'META',  // Meta (Facebook)
    'NVDA',  // NVIDIA
    'TSLA',  // Tesla
    'NFLX',  // Netflix
    'PYPL',  // PayPal
    'INTC',  // Intel
    'AMD',   // AMD
    'ADBE',  // Adobe
    'CRM',   // Salesforce
    'CSCO',  // Cisco
    'ORCL',  // Oracle
    // Financial Stocks
    'JPM',   // JP Morgan
    'BAC',   // Bank of America
    'V',     // Visa
    'MA',    // Mastercard
    // Consumer and Retail
    'WMT',   // Walmart
    'PG',    // Procter & Gamble
    'KO',    // Coca-Cola
    'DIS',   // Disney
    'MCD',   // McDonald's
    'NKE',   // Nike
    // Healthcare
    'JNJ',   // Johnson & Johnson
    'PFE',   // Pfizer
    'MRK',   // Merck
    'ABBV',  // AbbVie
    'UNH'    // UnitedHealth
  ];
  
  try {
    // Set up batch requests to avoid API rate limits
    const batchSize = 5;
    const stockDataArray: StockData[] = [];
    
    // Process requests in batches
    for (let i = 0; i < famousStocks.length; i += batchSize) {
      const batch = famousStocks.slice(i, i + batchSize);
      
      // Use cached function to get data
      const batchPromises = batch.map(symbol => fetchStockDataWithCache(symbol));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        stockDataArray.push(...batchResults);
        
        // Add small delay to avoid API rate limits
        if (i + batchSize < famousStocks.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (batchError) {
        console.error(`Batch request failed (${i}-${i+batchSize}):`, batchError);
        // Continue with next batch, don't interrupt the whole process
      }
    }
    
    // If we got too few data, try to fill with mock data
    if (stockDataArray.length < 10) {
      console.warn(`Too few actual stock data fetched (${stockDataArray.length}), using mock data`);
      const { mockFamousStocks } = await import('./mockStockData');
      
      // Filter out stocks we already have, only add missing ones
      const existingSymbols = stockDataArray.map(stock => stock.symbol);
      const missingMockStocks = mockFamousStocks.filter(stock => !existingSymbols.includes(stock.symbol));
      
      stockDataArray.push(...missingMockStocks);
    }
    
    return stockDataArray;
  } catch (error) {
    console.error('Failed to fetch popular stock data', error);
    
    // Use mock data as fallback
    try {
      const { mockFamousStocks } = await import('./mockStockData');
      return mockFamousStocks;
    } catch (mockError) {
      console.error('Failed to fetch mock data as well', mockError);
      return [];
    }
  }
}

/**
 * Fetch more stocks data (only available for premium users)
 */
export async function fetchMoreStocks(): Promise<StockData[]> {
  // Wider range of stocks, only accessible to paid users
  const moreStocks = [
    'HD',    // Home Depot
    'XOM',   // Exxon Mobil
    'CVX',   // Chevron
    'COST',  // Costco
    'ABNB',  // Airbnb
    'BA',    // Boeing
    'CAT',   // Caterpillar
    'MU',    // Micron Technology
    'RTX',   // Raytheon Technologies
    'TXN',   // Texas Instruments
    'BABA',  // Alibaba
    'LLY',   // Eli Lilly
    'MS',    // Morgan Stanley
    'UBER',  // Uber
    'GS',    // Goldman Sachs
    'VZ',    // Verizon
    'TGT',   // Target
    'SBUX',  // Starbucks
    'PEP',   // PepsiCo
    'QCOM'   // Qualcomm
  ];
  
  try {
    // Set up batch requests to avoid API rate limits
    const batchSize = 5;
    const stockDataArray: StockData[] = [];
    
    // Process requests in batches
    for (let i = 0; i < moreStocks.length; i += batchSize) {
      const batch = moreStocks.slice(i, i + batchSize);
      // Use cached function to get data
      const batchPromises = batch.map(symbol => fetchStockDataWithCache(symbol));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        stockDataArray.push(...batchResults);
        
        // Add small delay to avoid API rate limits
        if (i + batchSize < moreStocks.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (batchError) {
        console.error(`Batch request failed (${i}-${i+batchSize}):`, batchError);
        // Continue with next batch, don't interrupt the whole process
      }
    }
    
    // If we got too few data, try to fill with mock data
    if (stockDataArray.length < 5) {
      console.warn(`Too few additional stock data fetched (${stockDataArray.length}), using mock data`);
      
      // We don't have mock data prepared for 'more stocks', but we can use some popular stocks mock data as substitutes
      try {
        const { mockFamousStocks } = await import('./mockStockData');
        
        // Filter out stocks we already have, only add missing ones
        const existingSymbols = stockDataArray.map(stock => stock.symbol);
        
        // Get mock data different from more stocks as substitutes
        const availableMockStocks = mockFamousStocks.filter(stock => 
          !existingSymbols.includes(stock.symbol) && 
          !moreStocks.includes(stock.symbol)
        );
        
        // Add enough mock data to reach at least 5 stocks
        const neededCount = Math.max(5 - stockDataArray.length, 0);
        if (neededCount > 0 && availableMockStocks.length > 0) {
          const substituteMockStocks = availableMockStocks.slice(0, neededCount);
          stockDataArray.push(...substituteMockStocks);
          console.log(`Using ${substituteMockStocks.length} mock data to supplement additional stock data`);
        }
      } catch (mockError) {
        console.error('Failed to fetch mock data:', mockError);
      }
    }
    
    return stockDataArray;
  } catch (error) {
    console.error('Failed to fetch additional stock data', error);
    
    // Use mock data as fallback
    try {
      const { mockFamousStocks } = await import('./mockStockData');
      
      // Use some mock stock data not in the popular stocks list
      const startIndex = Math.min(10, mockFamousStocks.length - 1);
      const endIndex = Math.min(startIndex + 10, mockFamousStocks.length);
      
      if (startIndex < mockFamousStocks.length) {
        console.log(`Using mock data as fallback for additional stock data`);
        return mockFamousStocks.slice(startIndex, endIndex);
      }
      
      return [];
    } catch (mockError) {
      console.error('Failed to fetch mock data as well', mockError);
      return [];
    }
  }
} 
