import React from 'react';
import Link from 'next/link';
import { StockData } from '@/types';

interface StockCardProps {
  stock: StockData;
  detailed?: boolean;
}

const StockCard: React.FC<StockCardProps> = ({ stock, detailed = false }) => {
  const priceChange = stock.price?.regularMarketChange || 0;
  const priceChangePercent = stock.price?.regularMarketChangePercent || 0;
  const isPositive = priceChange >= 0;
  
  return (
    <Link href={`/stocks/analysis?symbol=${stock.symbol}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold">{stock.symbol}</h3>
              <p className="text-gray-600">{stock.quoteSummary?.longName || ''}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-white ${isPositive ? 'bg-green-600' : 'bg-red-600'}`}>
              {isPositive ? '上涨' : '下跌'}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">
              ${stock.price?.regularMarketPrice?.toFixed(2) || '0.00'}
            </div>
            <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-1">
                {isPositive ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </span>
              <span>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          
          {detailed && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">交易量</p>
                  <p className="font-medium">{(stock.price?.regularMarketVolume || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">市盈率</p>
                  <p className="font-medium">{stock.quoteSummary?.defaultKeyStatistics?.forwardPE?.fmt || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">日高</p>
                  <p className="font-medium">${stock.price?.regularMarketDayHigh?.toFixed(2) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">日低</p>
                  <p className="font-medium">${stock.price?.regularMarketDayLow?.toFixed(2) || 'N/A'}</p>
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