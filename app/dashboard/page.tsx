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

  // 您关注的股票列表 (硬编码示例)
  const watchedSymbols = ['AAPL', 'MSFT', 'GOOG']; 

  // 获取单个股票数据的函数
  const fetchStock = useCallback(async (symbol: string): Promise<StockData | null> => {
    try {
      const response = await fetch(`/api/stocks/${symbol}`);
      if (!response.ok) {
        console.error(`获取 ${symbol} 数据失败: ${response.statusText}`);
        return null; // 获取失败则返回 null
      }
      return await response.json();
    } catch (err) {
      console.error(`获取 ${symbol} 数据时发生错误:`, err);
      return null;
    }
  }, []);

  // 获取所有关注的股票数据
  useEffect(() => {
    const fetchAllStocks = async () => {
      setLoading(true);
      setError(null);
      try {
        const stockPromises = watchedSymbols.map(symbol => fetchStock(symbol));
        const results = await Promise.all(stockPromises);
        // 过滤掉获取失败的结果 (null)
        const validStocks = results.filter(stock => stock !== null) as StockData[];
        setStocks(validStocks);

        if (validStocks.length < watchedSymbols.length) {
          setError('部分关注的股票数据加载失败。');
        }
      } catch (err) {
        console.error('获取关注列表股票数据失败:', err);
        setError('加载关注列表失败，请稍后重试。');
        setStocks([]); // 清空股票列表
      } finally {
        setLoading(false);
      }
    };

    fetchAllStocks();
  }, [fetchStock]); // 依赖 fetchStock 函数
  
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Navbar user={user} />
        
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6">我的投资仪表盘</h1>
            
            {/* 用户资料卡 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">欢迎回来, {user?.email}</h2>
                  <p className="text-gray-600">
                    用户类型: <span className="font-medium">免费用户</span>
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Link href="/pricing">
                    <button className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors">
                      升级账户
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* 股票列表 */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">您关注的股票</h2>
                <Link href="/stocks" className="text-blue-900 font-medium flex items-center hover:text-blue-700">
                  查看更多
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
                  <p className="mt-2 text-gray-600">正在加载关注的股票数据...</p>
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
                  <p className="text-gray-600 mb-4">您尚未关注任何股票或加载失败</p>
                  <Link href="/stocks">
                    <button className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors">
                      浏览股票
                    </button>
                  </Link>
                </div>
              )}
            </section>
            
            {/* 快速分析 */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">快速分析</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-700 mb-4">
                  想要分析新股票？使用我们的股票分析工具，获取AI驱动的投资建议。
                </p>
                <Link href="/stocks/analysis">
                  <button className="bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition-colors w-full md:w-auto">
                    开始新分析
                  </button>
                </Link>
              </div>
            </section>
            
            {/* 最近交易建议 */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">最近交易建议</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b">
                  <div className="grid grid-cols-5 p-4 font-medium text-gray-700">
                    <div>股票</div>
                    <div>建议</div>
                    <div>信心度</div>
                    <div>来源</div>
                    <div>日期</div>
                  </div>
                </div>
                
                <div className="p-4 text-center text-gray-600">
                  暂无交易建议。升级到付费版以获取AI交易建议。
                </div>
                
                <div className="p-4 bg-gray-50 text-center">
                  <Link href="/pricing">
                    <button className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors">
                      升级账户
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