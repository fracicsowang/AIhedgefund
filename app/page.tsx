import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import StockCard from '@/components/StockCard';
import Footer from '@/components/Footer';
import SubscriptionBanner from '@/components/SubscriptionBanner';
import StockCategoryFilter from '@/components/StockCategoryFilter';
import InvestmentLegendsSection from '@/components/InvestmentLegendsSection';
import SystemWorksSection from '@/components/SystemWorksSection';
import { fetchFamousStocks } from '@/lib/fetchStockData';
import { StockData } from '@/types';

// Note: This is temporary code for debugging purposes
export function generateMetadata() {
  return {
    title: "AI Hedge Fund - Real-time Stock Analysis & Investment Advice",
  };
}

// Fetch stock data from server-side API, directly using Yahoo Finance API
async function getStocks() {
  try {
    // 适配服务端 SSR fetch 绝对路径
    const isServer = typeof window === 'undefined';
    let baseUrl = '';
    if (isServer) {
      baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    }
    const response = await fetch(`${baseUrl}/api/stocks`, {
      cache: 'no-store',
      next: { revalidate: 1800 } // Set 30 minutes revalidation time
    });

    if (!response.ok) {
      console.error('API returned error status:', response.status);
      // Try to fetch stock data directly on server side
      const stocksData = await fetchFamousStocks();
      console.log(`Fetched ${stocksData.length} stocks directly from Yahoo Finance`);
      return stocksData;
    }

    const data = await response.json();
    
    // If API returns fewer than 30 stocks
    if (!data || !Array.isArray(data) || data.length < 25) {
      console.log('API returned fewer than 30 stocks, fetching directly');
      const stocksData = await fetchFamousStocks();
      console.log(`Fetched ${stocksData.length} stocks directly from Yahoo Finance`);
      return stocksData;
    }
    
    console.log(`Fetched ${data.length} stocks from API`);
    return data;
  } catch (error) {
    console.error('Failed to fetch stock data, retrieving directly', error);
    // If API call fails, use fetchFamousStocks to get data directly from Yahoo
    try {
      const stocksData = await fetchFamousStocks();
      console.log(`After error, fetched ${stocksData.length} stocks from Yahoo Finance`);
      return stocksData;
    } catch (fallbackError) {
      console.error('Direct fetch also failed', fallbackError);
      // If direct fetch also fails, return empty array
      return [];
    }
  }
}

export default async function Home() {
  // Get popular stock data
  const stocks = await getStocks();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={null} />

      {/* Hero section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI-Powered Smart Investment Advisor
            </h1>
            <p className="text-xl mb-8">
              Combining the wisdom of multiple investment masters to provide more comprehensive stock trading recommendations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup">
                <button className="bg-white text-blue-900 font-bold py-3 px-6 rounded-md hover:bg-blue-50 transition-colors">
                  Sign Up Free
                </button>
              </Link>
              <Link href="/pricing">
                <button className="bg-transparent border-2 border-white text-white font-bold py-3 px-6 rounded-md hover:bg-blue-800 transition-colors">
                  View Subscription Plans
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription banner */}
      <div className="container mx-auto px-4 pt-8">
        <SubscriptionBanner subscriptionStatus="free" />
      </div>

      {/* Popular stocks card section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">Smart Analysis of Popular Stocks</h2>
          <p className="text-gray-600 mb-8 text-center">
            Real-time analysis of top stocks for precise trading recommendations
          </p>

          {/* Use separate stock category filter component */}
          <StockCategoryFilter stocks={stocks} />

          <div className="text-center mt-10">
            <Link href="/stocks">
              <button className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-6 rounded-md transition-colors">
                View More Stocks
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Investment masters section */}
      <InvestmentLegendsSection />

      {/* System works section */}
      <SystemWorksSection />

      {/* Pricing section preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">Choose a Subscription Plan That's Right for You</h2>
          <p className="text-gray-600 mb-12 text-center">
            Whether you're a beginner or an experienced investor, we have a plan that suits your needs
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-8">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 md:w-1/3">
              <h3 className="text-2xl font-bold mb-4">Free</h3>
              <p className="text-4xl font-bold mb-6">¥0<span className="text-gray-500 text-base font-normal">/month</span></p>
              <p className="text-gray-600 mb-4">Perfect for users who want to explore AI investment advisors</p>
              <ul className="mb-8">
                <li className="flex items-center mb-3">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Access to 7 popular stocks</span>
                </li>
                <li className="flex items-center mb-3">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Graham investment strategy</span>
                </li>
                <li className="flex items-center mb-3 text-gray-400">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>More investment legend strategies</span>
                </li>
                <li className="flex items-center mb-3 text-gray-400">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>Broader stock selection</span>
                </li>
                <li className="flex items-center mb-3 text-gray-400">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>Professional risk management tools</span>
                </li>
              </ul>
              <Link href="/signup">
                <button className="w-full bg-gray-200 text-gray-800 font-bold py-3 rounded-md hover:bg-gray-300 transition-colors">
                  Sign Up Free
                </button>
              </Link>
            </div>

            {/* Basic Plan */}
            <div className="bg-blue-900 text-white p-8 rounded-lg shadow-md border border-blue-800 md:w-1/3 relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-blue-900 px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-bold">
                Recommended
              </div>
              <h3 className="text-2xl font-bold mb-4">Basic</h3>
              <p className="text-4xl font-bold mb-6">¥59<span className="text-blue-300 text-base font-normal">/month</span></p>
              <p className="text-blue-100 mb-4">Quality choice for individual investors</p>
              <ul className="mb-8">
                <li className="flex items-center mb-3">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>All free plan features</span>
                </li>
                <li className="flex items-center mb-3">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>5 investment legend strategies</span>
                </li>
                <li className="flex items-center mb-3">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Access to 50+ stock analyses</span>
                </li>
                <li className="flex items-center mb-3">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Basic risk management tools</span>
                </li>
                <li className="flex items-center mb-3 text-blue-300">
                  <span className="text-red-400 mr-2">✗</span>
                  <span>Advanced technical analysis</span>
                </li>
              </ul>
              <Link href="/subscribe?plan=basic">
                <button className="w-full bg-white text-blue-900 font-bold py-3 rounded-md hover:bg-blue-50 transition-colors">
                  Choose This Plan
                </button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 md:w-1/3">
              <h3 className="text-2xl font-bold mb-4">Premium</h3>
              <p className="text-4xl font-bold mb-6">¥99<span className="text-gray-500 text-base font-normal">/month</span></p>
              <p className="text-gray-600 mb-4">Full-featured choice for professional investors</p>
              <ul className="mb-8">
                <li className="flex items-center mb-3">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>All basic plan features</span>
                </li>
                <li className="flex items-center mb-3">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>9 complete investment legend strategies</span>
                </li>
                <li className="flex items-center mb-3">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Access to 100+ stock analyses</span>
                </li>
                <li className="flex items-center mb-3">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Advanced risk management tools</span>
                </li>
                <li className="flex items-center mb-3">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Professional technical analysis indicators</span>
                </li>
              </ul>
              <Link href="/subscribe?plan=premium">
                <button className="w-full bg-gray-800 text-white font-bold py-3 rounded-md hover:bg-gray-700 transition-colors">
                  Choose This Plan
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 