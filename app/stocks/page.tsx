'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StockCard from '@/components/StockCard';
import { useAuth } from '@/lib/auth';
import { StockData } from '@/types';

export default function StocksPage() {
  const { user } = useAuth();
  const [allStocks, setAllStocks] = useState<StockData[]>([]); // Store all fetched stocks
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Popular/initial stocks list (hardcoded examples)
  const initialSymbols = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'TSLA', 'NVDA']; 

  // Function to fetch single stock data (similar to DashboardPage)
  const fetchStock = useCallback(async (symbol: string): Promise<StockData | null> => {
    try {
      const response = await fetch(`/api/stocks/${symbol}`);
      if (!response.ok) {
        console.error(`Failed to get ${symbol} data: ${response.statusText}`);
        return null;
      }
      return await response.json();
    } catch (err) {
      console.error(`Error occurred while fetching ${symbol} data:`, err);
      return null;
    }
  }, []);

  // Fetch initial stock list data
  useEffect(() => {
    const fetchInitialStocks = async () => {
      setLoading(true);
      setError(null);
      try {
        const stockPromises = initialSymbols.map(symbol => fetchStock(symbol));
        const results = await Promise.all(stockPromises);
        const validStocks = results.filter(stock => stock !== null) as StockData[];
        setAllStocks(validStocks);

        if (validStocks.length < initialSymbols.length) {
          setError('Some popular stocks failed to load.');
        }
      } catch (err) {
        console.error('Failed to fetch initial stock list data:', err);
        setError('Failed to load stock list, please try again later.');
        setAllStocks([]); // Clear list
      } finally {
        setLoading(false);
      }
    };

    fetchInitialStocks();
  }, [fetchStock]); // Depends on fetchStock

  // Filter stocks based on search term
  const filteredStocks = allStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    stock.quoteSummary?.longName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Stock Analysis Platform</h1>
          
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold mb-4 md:mb-0">Browse Stocks</h2>
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search stock code or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-5 h-5 absolute right-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <p className="text-gray-600 mb-2">Click on a stock card to enter detailed analysis page</p>
            
            <div className="flex items-center text-sm text-gray-600">
              <Link href="/stocks/analysis" className="text-blue-900 hover:text-blue-700 font-medium">
                Or go directly to analysis page →
              </Link>
            </div>
          </div>
          
          {/* Stock List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
              <p className="mt-2 text-gray-600">Loading stock data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          ) : filteredStocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStocks.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-100 rounded-lg">
              <p className="text-gray-700">
                {searchTerm ? 'No stocks matching your criteria found' : 'Unable to load stock list'}
              </p>
            </div>
          )}
          
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-3">Beginner's Guide</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Choose a stock you're interested in</li>
              <li>Enter the detailed analysis page</li>
              <li>Select your desired analyst combination</li>
              <li>Click "Analyze Stock" to start AI intelligent analysis</li>
              <li>Review analysis results and investment recommendations</li>
            </ol>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export const metadata = {
  title: 'Stocks | Legends AI - AI Agents for Stock Analysis',
  description: 'Explore real-time stock analysis powered by AI agents and legendary investor strategies. Get hedge fund-level insights and smart investment signals for your portfolio.',
  keywords: 'stocks, AI agent, stock analysis, hedge fund, investment, trading signals, legendary investors, portfolio, smart investing',
}; 