/**
 * Test script for Ben Graham strategy
 * 
 * This script runs a test of the Ben Graham investment strategy
 * without requiring an OpenAI API key. It uses mock data to simulate
 * a stock analysis.
 */

// Import the strategy and types
import { benGrahamStrategy } from './agents/benGraham';
import { StockData } from './types';

// Create mock stock data for testing
const mockStockData: StockData = {
  symbol: 'TEST',
  price: {
    regularMarketPrice: 100,
    regularMarketChange: 2.5,
    regularMarketChangePercent: 2.5,
    regularMarketDayHigh: 102,
    regularMarketDayLow: 98,
    regularMarketVolume: 1000000
  },
  quoteSummary: {
    longName: 'Test Company Inc.',
    // Add missing required properties based on how they're used
    fiftyTwoWeekHigh: 120,
    fiftyTwoWeekLow: 80,
    marketCap: 100000000,
    trailingPE: 12.5,
    epsTrailingTwelveMonths: 8.0,
    bookValue: 83.33,
    dividendYield: 0.02,
    defaultKeyStatistics: {
      forwardPE: { raw: 12.5, fmt: '12.5' },
      priceToBook: { raw: 1.2, fmt: '1.2' },
      trailingEPS: { raw: 8.0, fmt: '8.0' },
      bookValue: { raw: 83.33, fmt: '83.33' },
      sharesOutstanding: { raw: 1000000, fmt: '1M' },
      profitMargins: { raw: 0.15, fmt: '15%' }
    },
    financialData: {
      totalCash: { raw: 10000000, fmt: '10M' },
      totalDebt: { raw: 5000000, fmt: '5M' },
      totalRevenue: { raw: 50000000, fmt: '50M' },
      netIncome: { raw: 7500000, fmt: '7.5M' },
      operatingCashflow: { raw: 12000000, fmt: '12M' },
      revenueGrowth: { raw: 0.1, fmt: '10%' },
      earningsGrowth: { raw: 0.12, fmt: '12%' },
      dividendRate: { raw: 2.0, fmt: '2.0' }
    },
    balanceSheetHistory: {
      balanceSheetStatements: [
        {
          totalAssets: { raw: 150000000, fmt: '150M' },
          totalLiab: { raw: 50000000, fmt: '50M' },
          totalCurrentAssets: { raw: 80000000, fmt: '80M' },
          totalCurrentLiabilities: { raw: 30000000, fmt: '30M' }
        }
      ]
    }
  },
  technicalIndicators: {
    rsi: 55,
    macd: {
      macdLine: 0.5,
      signalLine: 0.3,
      histogram: 0.2
    },
    movingAverages: {
      ma50: 95,
      ma200: 90
    }
  },
  sentiment: {
    bearishPercent: 30,
    bullishPercent: 70,
    newsScore: 0.6
  }
};

// Test function
async function testGrahamStrategy() {
  console.log('===== Testing Ben Graham Strategy =====');
  console.log(`Testing with mock stock: ${mockStockData.symbol} (${mockStockData.quoteSummary?.longName || ''})\n`);
  
  try {
    // Call the strategy
    console.log('Running analysis...');
    const result = await benGrahamStrategy(mockStockData);
    
    // Output results
    console.log('\n===== Analysis Results =====');
    console.log(`Decision: ${result.decision}`);
    console.log(`Reasoning: ${result.reasoning}`);
    
    return result;
  } catch (error) {
    console.error('Error running Graham strategy:', error);
    throw error;
  }
}

// Run the test
testGrahamStrategy()
  .then(() => console.log('\nTest completed successfully'))
  .catch(err => console.error('Test failed:', err)); 