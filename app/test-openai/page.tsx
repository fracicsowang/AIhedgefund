'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TestOpenAIPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testOpenAI = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/stocks/analysis');
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || '调用API失败');
      }
    } catch (err: any) {
      setError(err.message || '请求过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={null} />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">OpenAI API测试页面</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <p className="mb-4">点击下方按钮测试OpenAI API连接</p>
            
            <button
              onClick={testOpenAI}
              disabled={loading}
              className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {loading ? '请求中...' : '测试OpenAI连接'}
            </button>
            
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <h3 className="font-bold mb-1">错误:</h3>
                <p>{error}</p>
              </div>
            )}
            
            {result && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">测试结果:</h3>
                <div className="p-4 bg-gray-100 rounded-md">
                  <p className="mb-2">
                    <span className="font-semibold">状态:</span> {result.success ? '成功' : '失败'}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">API密钥状态:</span> {result.apiKeyStatus}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">API密钥开头:</span> {result.apiKeyFirstChars}
                  </p>
                  
                  {result.response && (
                    <div>
                      <p className="font-semibold mb-1">OpenAI回复:</p>
                      <div className="p-3 bg-white border border-gray-300 rounded-md">
                        {result.response}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-gray-100 p-4 rounded-md mb-8">
            <h2 className="text-xl font-bold mb-2">服务器环境变量</h2>
            <p className="text-gray-600 mb-4">关于服务器端环境变量的说明:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>环境变量只能在服务器端访问</li>
              <li>在Next.js中，API路由和服务器组件可以访问环境变量</li>
              <li>客户端组件只能访问以NEXT_PUBLIC_开头的环境变量</li>
              <li>OpenAI API密钥必须在服务器端使用，不能泄露到客户端</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 