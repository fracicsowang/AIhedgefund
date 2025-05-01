import React from 'react';
import Link from 'next/link';
import { StockData } from '@/types';

interface StockCardProps {
  stock: StockData;
  detailed?: boolean;
}

const StockCard: React.FC<StockCardProps> = ({ stock, detailed = false }) => {
  // Safely get values to avoid null errors
  const price = stock.price?.regularMarketPrice || 0;
  const priceChange = stock.price?.regularMarketChange || 0;
  const priceChangePercent = stock.price?.regularMarketChangePercent || 0;
  const volume = stock.price?.regularMarketVolume || 0;
  const dayHigh = stock.price?.regularMarketDayHigh || 0;
  const dayLow = stock.price?.regularMarketDayLow || 0;
  const longName = stock.quoteSummary?.longName || stock.symbol;
  const symbol = stock.symbol || 'Unknown';
  
  const isPositive = priceChange >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeIcon = isPositive ? '↑' : '↓';
  
  // Display appropriate decimal places
  const formatPrice = (val: number) => {
    if (val > 1000) return val.toFixed(0);
    if (val > 100) return val.toFixed(1);
    return val.toFixed(2);
  };
  
  // Format large numbers for better readability (k, M, B)
  const formatLargeNumber = (num: number) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };
  
  // Simple color indicator for PE ratio
  const getPERatioColor = (pe: number) => {
    if (pe <= 0) return 'text-gray-500';
    if (pe < 15) return 'text-green-600';
    if (pe < 30) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Get PE ratio display
  const peRatio = stock.quoteSummary?.defaultKeyStatistics?.forwardPE?.raw || 0;
  const peRatioDisplay = peRatio <= 0 ? 'N/A' : peRatio.toFixed(2);
  const peRatioColor = getPERatioColor(peRatio);
  
  return (
    <Link 
      href={`/stocks/analysis?symbol=${symbol}`} 
      className="block transition-transform hover:scale-102 hover:shadow-lg"
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold tracking-tight">{symbol}</h3>
              <p className="text-gray-600 text-sm truncate" title={longName}>
                {longName}
              </p>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${isPositive ? 'bg-green-600' : 'bg-red-600'}`}>
              {isPositive ? 'Up' : 'Down'}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">
              ${formatPrice(price)}
            </div>
            <div className={`flex items-center ${changeColor}`}>
              <span className="mr-1">
                {isPositive ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </span>
              <span className="text-sm font-medium">
                {isPositive ? '+' : ''}{formatPrice(Math.abs(priceChange))} ({isPositive ? '+' : ''}{Math.abs(priceChangePercent).toFixed(2)}%)
              </span>
            </div>
          </div>
          
          {detailed && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Volume</p>
                  <p className="font-medium text-sm">{formatLargeNumber(volume)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">P/E Ratio</p>
                  <p className={`font-medium text-sm ${peRatioColor}`}>{peRatioDisplay}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Day High</p>
                  <p className="font-medium text-sm">${formatPrice(dayHigh)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Day Low</p>
                  <p className="font-medium text-sm">${formatPrice(dayLow)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default StockCard; 