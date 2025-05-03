import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import StockCard from '@/components/StockCard';
import Footer from '@/components/Footer';
import StockCategoryFilter from '@/components/StockCategoryFilter';
import InvestmentLegendsSection from '@/components/InvestmentLegendsSection';
import SystemWorksSection from '@/components/SystemWorksSection';
import { fetchFamousStocks } from '@/lib/fetchStockData';
import { StockData } from '@/types';
import Head from 'next/head';

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

export const metadata = {
  title: 'Legend AI | AI Investment Agents & Hedge Fund Strategies',
  description: 'Legend AI combines legendary investor strategies and advanced AI agents to deliver smart stock analysis, investment signals, and hedge fund-level insights for everyone. Free, intelligent, and easy to use.',
  keywords: 'AI agent, investment, hedge fund, stock analysis, smart investing, legendary investors, portfolio, trading signals, free AI investing',
};

export default async function Home() {
  // Get popular stock data
  const stocks = await getStocks();

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Legend AI",
              "url": "https://legendai.app",
              "description": "Legend AI combines legendary investor strategies and advanced AI agents to deliver smart stock analysis, investment signals, and hedge fund-level insights for everyone.",
              "publisher": {
                "@type": "Organization",
                "name": "Legend AI"
              }
            })
          }}
        />
      </Head>
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
              </div>
            </div>
          </div>
        </section>

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

        <Footer />
      </div>
    </>
  );
} 