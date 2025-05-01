'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StockCard from '@/components/StockCard';
import { useAuth } from '@/lib/auth';
import { ProtectedRoute } from '@/lib/auth';
import { StockData } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Your watched stocks list (hardcoded example)
  const watchedSymbols = ['AAPL', 'MSFT', 'GOOG']; 

  // Function to fetch individual stock data
  const fetchStock = useCallback(async (symbol: string): Promise<StockData | null> => {
    try {
      const response = await fetch(`/api/stocks/${symbol}`);
      if (!response.ok) {
        console.error(`Failed to fetch ${symbol} data: ${response.statusText}`);
        return null; // Return null if fetch fails
      }
      return await response.json();
    } catch (err) {
      console.error(`Error fetching ${symbol} data:`, err);
      return null;
    }
  }, []);

  // Fetch all watched stocks data
  useEffect(() => {
    const fetchAllStocks = async () => {
      setLoading(true);
      setError(null);
      try {
        const stockPromises = watchedSymbols.map(symbol => fetchStock(symbol));
        const results = await Promise.all(stockPromises);
        // Filter out failed results (null)
        const validStocks = results.filter(stock => stock !== null) as StockData[];
        setStocks(validStocks);

        if (validStocks.length < watchedSymbols.length) {
          setError('Some of your watched stocks failed to load.');
        }
      } catch (err) {
        console.error('Failed to fetch watched stocks data:', err);
        setError('Failed to load your watchlist. Please try again later.');
        setStocks([]); // Clear stocks list
      } finally {
        setLoading(false);
      }
    };

    fetchAllStocks();
  }, [fetchStock]); // Depends on fetchStock function
  
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Navbar user={user} />
        
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6">My Investment Dashboard</h1>
            
            {/* User profile card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Welcome back, {user?.email}</h2>
                  <p className="text-gray-600">
                    Account type: <span className="font-medium">Free User</span>
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Link href="/pricing">
                    <button className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors">
                      Upgrade Account
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Stocks list */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Your Watched Stocks</h2>
                <Link href="/stocks" className="text-blue-900 font-medium flex items-center hover:text-blue-700">
                  View More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
                  <p className="mt-2 text-gray-600">Loading watched stocks data...</p>
                </div>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              ) : stocks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stocks.map((stock: StockData) => (
                    <StockCard key={stock.symbol} stock={stock} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <p className="text-gray-600 mb-4">You haven't watched any stocks yet or loading failed</p>
                  <Link href="/stocks">
                    <button className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors">
                      Browse Stocks
                    </button>
                  </Link>
                </div>
              )}
            </section>
            
            {/* Quick Analysis */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Quick Analysis</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-700 mb-4">
                  Want to analyze a new stock? Use our stock analysis tool to get AI-powered investment recommendations.
                </p>
                <Link href="/stocks/analysis">
                  <button className="bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition-colors w-full md:w-auto">
                    Start New Analysis
                  </button>
                </Link>
              </div>
            </section>
            
            {/* Recent Trading Recommendations */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Recent Trading Recommendations</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b">
                  <div className="grid grid-cols-5 p-4 font-medium text-gray-700">
                    <div>Stock</div>
                    <div>Recommendation</div>
                    <div>Confidence</div>
                    <div>Source</div>
                    <div>Date</div>
                  </div>
                </div>
                
                <div className="p-4 text-center text-gray-600">
                  No trading recommendations yet. Upgrade to premium to get AI trading recommendations.
                </div>
                
                <div className="p-4 bg-gray-50 text-center">
                  <Link href="/pricing">
                    <button className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors">
                      Upgrade Account
                    </button>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
} 