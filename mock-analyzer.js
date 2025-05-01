/**
 * Mock Stock Analyzer
 * 
 * This script simulates the stock analysis functionality without requiring
 * OpenAI API keys or other external services. It's useful for testing the
 * application logic without setting up all the environment variables.
 */

// Mock stock data - you can add more stocks as needed
const mockStocks = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 188.37,
    change: 1.25,
    changePercent: 0.67,
    pe: 31.2,
    marketCap: '2.94T',
    volume: '56.2M'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 415.60,
    change: 2.31,
    changePercent: 0.56,
    pe: 36.8,
    marketCap: '3.09T',
    volume: '21.5M'
  },
  {
    symbol: 'GOOG',
    name: 'Alphabet Inc.',
    price: 172.95,
    change: -0.68,
    changePercent: -0.39,
    pe: 26.5,
    marketCap: '2.14T',
    volume: '18.7M'
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 179.83,
    change: 1.05,
    changePercent: 0.59,
    pe: 56.2,
    marketCap: '1.87T',
    volume: '32.8M'
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    price: 508.02,
    change: 4.29,
    changePercent: 0.85,
    pe: 29.7,
    marketCap: '1.29T',
    volume: '14.2M'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 238.89,
    change: -2.67,
    changePercent: -1.11,
    pe: 68.2,
    marketCap: '761.7B',
    volume: '102.5M'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 119.91,
    change: 1.36,
    changePercent: 1.15,
    pe: 70.1,
    marketCap: '2.96T',
    volume: '261.9M'
  }
];

// Mock investment analysis results
const mockAnalysisResults = {
  'AAPL': { 
    benGraham: { decision: 'HOLD', reasoning: 'Current P/E ratio is above Graham\'s safety threshold.', confidence: 65 },
    warrenBuffett: { decision: 'BUY', reasoning: 'Strong economic moat and consistent cash flow.', confidence: 82 },
    riskManager: { decision: 'HOLD', reasoning: 'Moderate volatility, set stop loss at $175.', confidence: 75 },
    finalDecision: { decision: 'HOLD', reasoning: 'While the company has strong fundamentals, current valuation suggests waiting for a better entry point.', confidence: 70 }
  },
  'MSFT': { 
    benGraham: { decision: 'SELL', reasoning: 'Current valuation exceeds Graham\'s margin of safety requirements.', confidence: 72 },
    warrenBuffett: { decision: 'BUY', reasoning: 'Excellent business economics and competitive advantages.', confidence: 88 },
    riskManager: { decision: 'HOLD', reasoning: 'Low volatility but high valuation presents moderate risk.', confidence: 68 },
    finalDecision: { decision: 'HOLD', reasoning: 'Strong business fundamentals but overvalued according to value investing principles.', confidence: 65 }
  },
  'GOOG': { 
    benGraham: { decision: 'BUY', reasoning: 'Reasonable P/E relative to growth and strong balance sheet.', confidence: 78 },
    warrenBuffett: { decision: 'BUY', reasoning: 'Dominant market position and excellent capital allocation.', confidence: 85 },
    riskManager: { decision: 'BUY', reasoning: 'Moderate volatility with strong upside potential.', confidence: 80 },
    finalDecision: { decision: 'BUY', reasoning: 'Strong fundamentals, reasonable valuation, and good risk-reward profile.', confidence: 82 }
  },
  'AMZN': { 
    benGraham: { decision: 'SELL', reasoning: 'P/E ratio significantly exceeds Graham\'s criteria.', confidence: 75 },
    warrenBuffett: { decision: 'BUY', reasoning: 'Exceptional business model with growing competitive advantages.', confidence: 80 },
    riskManager: { decision: 'HOLD', reasoning: 'Higher than average volatility, set stop loss at $160.', confidence: 65 },
    finalDecision: { decision: 'HOLD', reasoning: 'Excellent business but current valuation requires caution.', confidence: 70 }
  },
  'META': { 
    benGraham: { decision: 'HOLD', reasoning: 'P/E ratio is near the threshold of Graham\'s criteria.', confidence: 60 },
    warrenBuffett: { decision: 'BUY', reasoning: 'Strong network effects and improving capital allocation.', confidence: 75 },
    riskManager: { decision: 'BUY', reasoning: 'Moderate risk profile with good upside potential.', confidence: 72 },
    finalDecision: { decision: 'BUY', reasoning: 'Reasonable valuation combined with strong business fundamentals.', confidence: 70 }
  },
  'TSLA': { 
    benGraham: { decision: 'SELL', reasoning: 'Extreme P/E ratio far exceeds Graham\'s value criteria.', confidence: 90 },
    warrenBuffett: { decision: 'SELL', reasoning: 'Uncertain competitive advantages and poor capital allocation.', confidence: 65 },
    riskManager: { decision: 'SELL', reasoning: 'High volatility presents substantial downside risk.', confidence: 85 },
    finalDecision: { decision: 'SELL', reasoning: 'Overvaluation combined with high risk profile suggests reducing exposure.', confidence: 80 }
  },
  'NVDA': { 
    benGraham: { decision: 'SELL', reasoning: 'Valuation far exceeds Graham\'s margin of safety principles.', confidence: 88 },
    warrenBuffett: { decision: 'HOLD', reasoning: 'Strong competitive position but extreme valuation.', confidence: 65 },
    riskManager: { decision: 'HOLD', reasoning: 'Very high volatility, set tight stop loss if holding.', confidence: 60 },
    finalDecision: { decision: 'SELL', reasoning: 'Despite industry leadership, current valuation presents significant risk.', confidence: 75 }
  }
};

// Mock API functions
function getStocks() {
  return mockStocks;
}

function getStockAnalysis(symbol) {
  if (!mockAnalysisResults[symbol]) {
    return {
      error: 'Stock analysis not found',
      symbol
    };
  }
  
  return {
    symbol,
    timestamp: new Date().toISOString(),
    analysis: mockAnalysisResults[symbol]
  };
}

// Command line interface
function printHelp() {
  console.log('\nMock Stock Analyzer Commands:');
  console.log('  list              - List all available stocks');
  console.log('  analyze [symbol]  - Analyze a specific stock');
  console.log('  help              - Show this help message');
  console.log('  exit              - Exit the program');
}

function listStocks() {
  console.log('\n===== Available Stocks =====');
  console.log('Symbol  | Name                   | Price   | Change  | P/E   | Market Cap');
  console.log('--------+------------------------+---------+---------+-------+------------');
  
  mockStocks.forEach(stock => {
    const change = stock.change >= 0 ? `+${stock.change}` : stock.change;
    const changePct = stock.changePercent >= 0 ? `+${stock.changePercent}%` : `${stock.changePercent}%`;
    
    console.log(
      `${stock.symbol.padEnd(8)}| ` +
      `${stock.name.padEnd(24)}| ` +
      `$${stock.price.toFixed(2).padEnd(7)}| ` +
      `${change} (${changePct.padEnd(5)})| ` +
      `${stock.pe.toFixed(1).padEnd(5)}| ` +
      `${stock.marketCap}`
    );
  });
}

function analyzeStock(symbol) {
  const stock = mockStocks.find(s => s.symbol === symbol);
  if (!stock) {
    console.log(`\nStock with symbol '${symbol}' not found.`);
    console.log('Use the "list" command to see available stocks.');
    return;
  }
  
  const analysis = getStockAnalysis(symbol);
  
  console.log(`\n===== Analysis for ${stock.name} (${symbol}) =====`);
  console.log(`Current Price: $${stock.price} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent}%)`);
  console.log(`Market Cap: ${stock.marketCap}`);
  console.log(`P/E Ratio: ${stock.pe}`);
  console.log(`Trading Volume: ${stock.volume}`);
  
  console.log('\n--- Investment Strategies ---');
  
  console.log(`\nBen Graham (Value Investor):`);
  console.log(`Decision: ${analysis.analysis.benGraham.decision}`);
  console.log(`Reasoning: ${analysis.analysis.benGraham.reasoning}`);
  console.log(`Confidence: ${analysis.analysis.benGraham.confidence}%`);
  
  console.log(`\nWarren Buffett (Economic Moat):`);
  console.log(`Decision: ${analysis.analysis.warrenBuffett.decision}`);
  console.log(`Reasoning: ${analysis.analysis.warrenBuffett.reasoning}`);
  console.log(`Confidence: ${analysis.analysis.warrenBuffett.confidence}%`);
  
  console.log(`\nRisk Manager:`);
  console.log(`Decision: ${analysis.analysis.riskManager.decision}`);
  console.log(`Reasoning: ${analysis.analysis.riskManager.reasoning}`);
  console.log(`Confidence: ${analysis.analysis.riskManager.confidence}%`);
  
  console.log(`\n--- Final Decision ---`);
  console.log(`Decision: ${analysis.analysis.finalDecision.decision}`);
  console.log(`Reasoning: ${analysis.analysis.finalDecision.reasoning}`);
  console.log(`Confidence: ${analysis.analysis.finalDecision.confidence}%`);
}

// Main program loop
async function main() {
  console.log('\n===== Mock Stock Analyzer =====');
  console.log('This tool simulates the AI Hedge Fund application without requiring API keys.');
  printHelp();
  
  // Check if command line arguments were provided
  const args = process.argv.slice(2);
  if (args.length > 0) {
    if (args[0] === 'list') {
      listStocks();
    } else if (args[0] === 'analyze' && args[1]) {
      analyzeStock(args[1]);
    } else {
      console.log('Invalid command or missing arguments.');
      printHelp();
    }
    return;
  }
  
  // If no arguments, start interactive mode
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.setPrompt('analyzer> ');
  readline.prompt();
  
  readline.on('line', (line) => {
    const args = line.trim().split(' ');
    const command = args[0].toLowerCase();
    
    if (command === 'exit') {
      readline.close();
      return;
    } else if (command === 'help') {
      printHelp();
    } else if (command === 'list') {
      listStocks();
    } else if (command === 'analyze') {
      if (args[1]) {
        analyzeStock(args[1].toUpperCase());
      } else {
        console.log('Please specify a stock symbol to analyze.');
      }
    } else {
      console.log(`Unknown command: ${command}`);
      printHelp();
    }
    
    readline.prompt();
  });
  
  readline.on('close', () => {
    console.log('\nThank you for using Mock Stock Analyzer!');
    process.exit(0);
  });
}

// Start the program
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 