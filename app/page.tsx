import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import StockCard from '@/components/StockCard';
import Footer from '@/components/Footer';
import SubscriptionBanner from '@/components/SubscriptionBanner';
import { fetchFamousStocks } from '@/lib/fetchStockData';
import { StockData } from '@/types';

// 注意: 这只是用于调试的临时代码
export function generateMetadata() {
  // 安全地检查并打印环境变量
  console.log("----- 环境变量检查 -----");
  console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? `存在，长度: ${process.env.OPENAI_API_KEY.length}` : "未定义");
  console.log("OPENAI_API_KEY 前10个字符:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) : "N/A");
  console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "已设置" : "未设置");
  console.log("-------------------------");
  
  return {
    title: "AI Hedge Fund",
  };
}

// 从服务器端API获取股票数据，而不是直接调用yahooFinance API
async function getStocks() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/stocks`, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error('获取股票数据失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取股票数据失败', error);
    return [];
  }
}

export default async function Home() {
  // 获取热门股票数据
  const stocks = await getStocks();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={null} />
      
      {/* 英雄区域 */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI驱动的智能投资顾问
            </h1>
            <p className="text-xl mb-8">
              结合多位投资大师的智慧，为您提供更全面的股票交易建议。
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup">
                <button className="bg-white text-blue-900 font-bold py-3 px-6 rounded-md hover:bg-blue-50 transition-colors">
                  免费注册
                </button>
              </Link>
              <Link href="/pricing">
                <button className="bg-transparent border-2 border-white text-white font-bold py-3 px-6 rounded-md hover:bg-blue-800 transition-colors">
                  查看订阅方案
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* 订阅横幅 */}
      <div className="container mx-auto px-4 pt-8">
        <SubscriptionBanner subscriptionStatus="free" />
      </div>
      
      {/* 热门股票卡片区域 */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">热门股票智能分析</h2>
          <p className="text-gray-600 mb-8 text-center">
            了解顶级科技股的实时交易建议
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock: StockData) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link href="/stocks">
              <button className="bg-blue-900 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-800 transition-colors">
                查看更多股票
              </button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* 特色功能区域 */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">我们的特色</h2>
          <p className="text-gray-600 mb-12 text-center">
            AI Hedge Fund提供的独特优势
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-900 text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-2">多位投资大师智慧</h3>
              <p className="text-gray-600">
                融合巴菲特、格雷厄姆等9位投资大师的投资策略，提供更全面的投资建议。
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-900 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">全方位数据分析</h3>
              <p className="text-gray-600">
                结合基本面、技术面、情绪面的多维度分析，帮助您做出更明智的投资决策。
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-900 text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">风险管理机制</h3>
              <p className="text-gray-600">
                内置风险评估系统，提供止损建议，帮助您控制投资风险。
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* 定价区域预览 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">选择适合您的方案</h2>
          <p className="text-gray-600 mb-12 text-center">
            灵活的订阅方案，满足不同投资者的需求
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 md:w-1/3">
              <h3 className="text-2xl font-bold mb-4">免费版</h3>
              <p className="text-4xl font-bold mb-6">¥0<span className="text-gray-500 text-base font-normal">/月</span></p>
              <ul className="mb-8">
                <li className="flex items-center mb-3">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>访问7只热门股票</span>
                </li>
                <li className="flex items-center mb-3">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>格雷厄姆投资策略</span>
                </li>
                <li className="flex items-center mb-3 text-gray-400">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>更多投资大师策略</span>
                </li>
                <li className="flex items-center mb-3 text-gray-400">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>更广泛的股票池</span>
                </li>
              </ul>
              <Link href="/signup">
                <button className="w-full bg-gray-200 text-gray-800 font-bold py-3 rounded-md hover:bg-gray-300 transition-colors">
                  免费注册
                </button>
              </Link>
            </div>
            
            <div className="bg-blue-900 text-white p-8 rounded-lg shadow-md border border-blue-800 md:w-1/3 relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-blue-900 px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-bold">
                推荐
              </div>
              <h3 className="text-2xl font-bold mb-4">高级版</h3>
              <p className="text-4xl font-bold mb-6">¥99<span className="text-blue-300 text-base font-normal">/月</span></p>
              <ul className="mb-8">
                <li className="flex items-center mb-3">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>所有免费版功能</span>
                </li>
                <li className="flex items-center mb-3">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>9位投资大师完整策略</span>
                </li>
                <li className="flex items-center mb-3">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>访问100+股票分析</span>
                </li>
                <li className="flex items-center mb-3">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>高级风险管理工具</span>
                </li>
              </ul>
              <Link href="/pricing">
                <button className="w-full bg-white text-blue-900 font-bold py-3 rounded-md hover:bg-blue-50 transition-colors">
                  立即升级
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