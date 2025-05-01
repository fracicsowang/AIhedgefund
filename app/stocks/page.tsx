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
  const [allStocks, setAllStocks] = useState<StockData[]>([]); // 存储所有获取到的股票
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 热门/初始股票列表 (硬编码示例)
  const initialSymbols = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'TSLA', 'NVDA']; 

  // 获取单个股票数据的函数 (与 DashboardPage 类似)
  const fetchStock = useCallback(async (symbol: string): Promise<StockData | null> => {
    try {
      const response = await fetch(`/api/stocks/${symbol}`);
      if (!response.ok) {
        console.error(`获取 ${symbol} 数据失败: ${response.statusText}`);
        return null;
      }
      return await response.json();
    } catch (err) {
      console.error(`获取 ${symbol} 数据时发生错误:`, err);
      return null;
    }
  }, []);

  // 获取初始列表的股票数据
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
          setError('部分热门股票数据加载失败。');
        }
      } catch (err) {
        console.error('获取初始股票列表数据失败:', err);
        setError('加载股票列表失败，请稍后重试。');
        setAllStocks([]); // 清空列表
      } finally {
        setLoading(false);
      }
    };

    fetchInitialStocks();
  }, [fetchStock]); // 依赖 fetchStock

  // 根据搜索词过滤股票
  const filteredStocks = allStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    stock.quoteSummary?.longName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">股票分析平台</h1>
          
          {/* 搜索栏 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold mb-4 md:mb-0">浏览股票</h2>
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="搜索股票代码或名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-5 h-5 absolute right-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <p className="text-gray-600 mb-2">点击股票卡片进入详细分析页面</p>
            
            <div className="flex items-center text-sm text-gray-600">
              <Link href="/stocks/analysis" className="text-blue-900 hover:text-blue-700 font-medium">
                或直接进入分析页面 →
              </Link>
            </div>
          </div>
          
          {/* 股票列表 */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
              <p className="mt-2 text-gray-600">正在加载股票数据...</p>
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
                {searchTerm ? '未找到符合条件的股票' : '无法加载股票列表'}
              </p>
            </div>
          )}
          
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-3">新手指南</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>选择一支您感兴趣的股票</li>
              <li>进入详细分析页面</li>
              <li>选择您想要的分析师组合</li>
              <li>点击"分析股票"开始AI智能分析</li>
              <li>查看分析结果和投资建议</li>
            </ol>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 