"use client";

import React, { useState, useEffect } from 'react';
import { StockData } from '@/types';
import StockCard from './StockCard';

// Stock category definitions and color mapping
export const stockCategories = {
  tech: {
    symbols: ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'META', 'NVDA', 'TSLA', 'NFLX', 'PYPL', 'INTC', 'AMD', 'ADBE', 'CRM', 'CSCO', 'ORCL'],
    name: 'Technology',
    bgColor: 'bg-blue-600',
    hoverBgColor: 'hover:bg-blue-700',
    lightBgColor: 'bg-blue-100',
    lightTextColor: 'text-blue-800',
    lightHoverBgColor: 'hover:bg-blue-200'
  },
  finance: {
    symbols: ['JPM', 'BAC', 'V', 'MA'],
    name: 'Finance',
    bgColor: 'bg-green-600',
    hoverBgColor: 'hover:bg-green-700',
    lightBgColor: 'bg-green-100',
    lightTextColor: 'text-green-800',
    lightHoverBgColor: 'hover:bg-green-200'
  },
  consumer: {
    symbols: ['WMT', 'PG', 'KO', 'DIS', 'MCD', 'NKE'],
    name: 'Consumer Retail',
    bgColor: 'bg-purple-600',
    hoverBgColor: 'hover:bg-purple-700',
    lightBgColor: 'bg-purple-100',
    lightTextColor: 'text-purple-800',
    lightHoverBgColor: 'hover:bg-purple-200'
  },
  healthcare: {
    symbols: ['JNJ', 'PFE', 'MRK', 'ABBV', 'UNH'],
    name: 'Healthcare',
    bgColor: 'bg-red-600',
    hoverBgColor: 'hover:bg-red-700',
    lightBgColor: 'bg-red-100',
    lightTextColor: 'text-red-800',
    lightHoverBgColor: 'hover:bg-red-200'
  },
  all: {
    symbols: [],
    name: 'All',
    bgColor: 'bg-gray-700',
    hoverBgColor: 'hover:bg-gray-800',
    lightBgColor: 'bg-gray-100',
    lightTextColor: 'text-gray-800',
    lightHoverBgColor: 'hover:bg-gray-200'
  }
};

interface StockCategoryFilterProps {
  stocks: StockData[];
}

export default function StockCategoryFilter({ stocks }: StockCategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [counts, setCounts] = useState<{[key: string]: number}>({});

  // Calculate the number of stocks in each category
  useEffect(() => {
    const categoryCounts: {[key: string]: number} = {};
    
    Object.keys(stockCategories).forEach(category => {
      if (category === 'all') {
        categoryCounts[category] = stocks.length;
      } else {
        const symbols = (stockCategories as any)[category].symbols;
        categoryCounts[category] = stocks.filter(stock => 
          symbols.includes(stock.symbol)
        ).length;
      }
    });
    
    setCounts(categoryCounts);
  }, [stocks]);

  // Filter stocks based on active category
  useEffect(() => {
    setLoading(true);
    
    let filtered = stocks;
    if (activeCategory !== 'all') {
      const symbols = (stockCategories as any)[activeCategory].symbols;
      filtered = stocks.filter(stock => symbols.includes(stock.symbol));
    }
    
    // Use setTimeout to simulate a short delay for smoother filtering effect
    const timer = setTimeout(() => {
      setFilteredStocks(filtered);
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [activeCategory, stocks]);

  return (
    <div className="space-y-6">
      {/* Category tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {Object.keys(stockCategories).map(category => {
          const cat = (stockCategories as any)[category];
          const isActive = activeCategory === category;
          const count = counts[category] || 0;
          
          return (
            <button 
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-2 ${
                isActive 
                  ? `${cat.bgColor} text-white ${cat.hoverBgColor}` 
                  : `${cat.lightBgColor} ${cat.lightTextColor} ${cat.lightHoverBgColor}`
              }`}
            >
              <span>{cat.name}</span>
              <span className={`inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ${
                isActive ? 'bg-white text-gray-800' : 'bg-gray-200 text-gray-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Stock grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredStocks && filteredStocks.length > 0 ? (
            filteredStocks.map((stock: StockData) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No stock data available for this category...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 