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
              </div>
            </div>
            
           
            
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
                  No trading recommendations yet.
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