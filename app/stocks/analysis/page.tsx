'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';
import { StockData } from '@/types';

// 导入分析代理
import { benGrahamStrategy } from '@/agents/benGraham';

interface Agent {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

export default function StockAnalysisPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || '';
  
  const [symbol, setSymbol] = useState(initialSymbol);
  const [searchInput, setSearchInput] = useState(initialSymbol);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  // 添加OpenAI API Key相关状态
  const [openAIKey, setOpenAIKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  
  // 分析流程相关状态
  const [agents, setAgents] = useState<Agent[]>([
    { id: 'benGraham', name: 'Ben Graham', description: '价值投资之父，专注于安全边际和价值选股', selected: true },
    { id: 'warrenBuffett', name: 'Warren Buffett', description: '关注企业的经济护城河和长期竞争优势', selected: false },
    { id: 'riskManager', name: '风险控制', description: '评估投资风险，设定止损点', selected: false },
  ]);
  const [analysisSteps, setAnalysisSteps] = useState<{step: string, status: 'waiting' | 'processing' | 'completed' | 'error', message: string}[]>([]);
  const [analysisResults, setAnalysisResults] = useState<{agent: string, decision: string, reasoning: string, confidence?: number, detailedAnalysis?: string}[]>([]);
  const [finalDecision, setFinalDecision] = useState<{decision: string, reasoning: string, confidence: number} | null>(null);
  
  // 当URL中的symbol参数变化时更新状态
  useEffect(() => {
    if (initialSymbol) {
      setSymbol(initialSymbol);
      setSearchInput(initialSymbol);
      fetchStockData(initialSymbol);
    }
  }, [initialSymbol]);
  
  // 模拟股票搜索
  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    
    try {
      // 这里可以替换为实际的API调用
      setLoading(true);
      setTimeout(() => {
        const results = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'TSLA'].filter(s => 
          s.toLowerCase().includes(searchInput.toLowerCase())
        );
        setSearchResults(results);
        setShowResults(true);
        setLoading(false);
      }, 500);
    } catch (error) {
      setError('搜索股票时出错');
      setLoading(false);
    }
  };
  
  // 选择搜索结果
  const selectStock = (selectedSymbol: string) => {
    setSymbol(selectedSymbol);
    setSearchInput(selectedSymbol);
    setShowResults(false);
    
    // 更新URL以反映选择的股票
    router.push(`/stocks/analysis?symbol=${selectedSymbol}`);
    
    // 获取股票数据
    fetchStockData(selectedSymbol);
  };
  
  // 获取股票数据
  const fetchStockData = async (stockSymbol: string) => {
    try {
      setLoading(true);
      setError(null);
      setStockData(null); // 清除旧数据
      setAnalysisSteps([]); // 重置分析步骤
      setAnalysisResults([]); // 重置分析结果
      setFinalDecision(null); // 重置最终决策

      // 调用我们的 API 路由
      const response = await fetch(`/api/stocks/${stockSymbol}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `获取 ${stockSymbol} 数据失败: ${response.statusText}`);
      }

      const data: StockData = await response.json();
      setStockData(data);
      
    } catch (error: any) {
      console.error('获取股票数据失败:', error);
      setError(error.message || '获取股票数据时发生未知错误');
      setStockData(null); // 确保出错时清空数据
    } finally {
      setLoading(false);
    }
  };
  
  // 切换代理选择
  const toggleAgent = (agentId: string) => {
    setAgents(agents.map(agent => 
      agent.id === agentId ? { ...agent, selected: !agent.selected } : agent
    ));
  };
  
  // 开始分析流程
  const startAnalysis = async () => {
    if (!stockData) {
      setError('请先选择股票');
      return;
    }
    
    const selectedAgents = agents.filter(agent => agent.selected);
    if (selectedAgents.length === 0) {
      setError('请至少选择一个分析师');
      return;
    }
    
    // 验证API Key（如果Ben Graham被选中）
    const benGrahamSelected = selectedAgents.some(agent => agent.id === 'benGraham');
    if (benGrahamSelected && (!openAIKey || openAIKey.trim() === '')) {
      setKeyError('使用Ben Graham策略需要OpenAI API Key');
      setShowKeyInput(true);
      return;
    }
    
    setAnalyzing(true);
    setError(null);
    setKeyError(null);
    setAnalysisSteps([]);
    setAnalysisResults([]);
    setFinalDecision(null);
    
    try {
      // 第一步：初始化分析过程
      setAnalysisSteps(prev => [...prev, {
        step: '初始化分析过程',
        status: 'processing',
        message: '准备分析数据...'
      }]);
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalysisSteps(prev => [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 1], status: 'completed', message: '分析数据准备完成' }
      ]);
      
      // 第二步：分析师评估
      for (const agent of selectedAgents) {
        setAnalysisSteps(prev => [...prev, {
          step: `${agent.name}分析`,
          status: 'processing',
          message: `${agent.name}正在分析${stockData.symbol}...`
        }]);
        
        // 模拟不同的分析时间
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
        
        // 根据代理ID获取实际分析结果
        let result;
        if (agent.id === 'benGraham') {
          // 使用实际的Ben Graham代理
          try {
            // 调用API端点进行分析，并传递用户提供的API Key
            const response = await fetch('/api/agent-decision/benGraham', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                stockData,
                apiKey: openAIKey.trim()
              }),
            });
            
            if (!response.ok) {
              throw new Error(`分析请求失败: ${response.statusText}`);
            }
            
            const grahamResult = await response.json();
            result = {
              agent: agent.name,
              decision: grahamResult.decision,
              reasoning: grahamResult.reasoning,
              confidence: grahamResult.confidence || (75 + Math.random() * 10),
              detailedAnalysis: grahamResult.detailedAnalysis
            };
          } catch (error) {
            console.error('执行Graham策略时出错:', error);
            result = {
              agent: agent.name,
              decision: 'HOLD',
              reasoning: '分析过程中出现错误，建议持有等待更多数据。',
              confidence: 50
            };
          }
        } else {
          // 模拟其他代理的结果
          const decisions = ['BUY', 'SELL', 'HOLD'];
          const randomDecision = decisions[Math.floor(Math.random() * decisions.length)];
          
          result = {
            agent: agent.name,
            decision: randomDecision,
            reasoning: `基于${agent.id}的分析方法，${randomDecision === 'BUY' ? '发现该股票具有投资价值' : 
              randomDecision === 'SELL' ? '该股票存在风险因素' : '建议持有观望'}。`,
            confidence: 60 + Math.random() * 30
          };
        }
        
        setAnalysisResults(prev => [...prev, result]);
        
        setAnalysisSteps(prev => [
          ...prev.slice(0, -1),
          { 
            ...prev[prev.length - 1], 
            status: 'completed', 
            message: `${agent.name}分析完成: ${result.decision}`
          }
        ]);
      }
      
      // 第三步：风险管理
      setAnalysisSteps(prev => [...prev, {
        step: '风险管理评估',
        status: 'processing',
        message: '评估投资风险...'
      }]);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const riskAssessment = {
        riskLevel: Math.random() < 0.7 ? '适中' : '较高',
        stopLoss: (stockData.price?.regularMarketPrice || 0) * 0.9,
        maxDrawdown: '10%'
      };
      
      setAnalysisSteps(prev => [
        ...prev.slice(0, -1),
        { 
          ...prev[prev.length - 1], 
          status: 'completed', 
          message: `风险等级: ${riskAssessment.riskLevel}, 建议止损点: $${riskAssessment.stopLoss.toFixed(2)}`
        }
      ]);
      
      // 第四步：投资组合管理器决策
      setAnalysisSteps(prev => [...prev, {
        step: '投资组合管理',
        status: 'processing',
        message: '生成最终投资决策...'
      }]);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 统计各决策的数量和总信心
      const decisionCounts = { BUY: 0, SELL: 0, HOLD: 0 };
      const decisionConfidence = { BUY: 0, SELL: 0, HOLD: 0 };
      
      analysisResults.forEach(result => {
        const decision = result.decision as keyof typeof decisionCounts;
        decisionCounts[decision]++;
        decisionConfidence[decision] += result.confidence || 0;
      });
      
      // 找出最多的决策
      let finalDecisionType = 'HOLD';
      let maxCount = 0;
      
      (Object.keys(decisionCounts) as Array<keyof typeof decisionCounts>).forEach(decision => {
        if (decisionCounts[decision] > maxCount) {
          maxCount = decisionCounts[decision];
          finalDecisionType = decision;
        } else if (decisionCounts[decision] === maxCount && 
                  decisionConfidence[decision] > decisionConfidence[finalDecisionType as keyof typeof decisionConfidence]) {
          // 如果计数相同，选择置信度更高的
          finalDecisionType = decision;
        }
      });
      
      // 计算平均置信度
      const avgConfidence = decisionConfidence[finalDecisionType as keyof typeof decisionConfidence] / 
                           (decisionCounts[finalDecisionType as keyof typeof decisionCounts] || 1);
      
      // 生成最终决策对象
      const decision = {
        decision: finalDecisionType,
        reasoning: `基于${analysisResults.length}位分析师的评估，综合考虑各因素后，建议` + 
          (finalDecisionType === 'BUY' ? '买入' :
           finalDecisionType === 'SELL' ? '卖出' : '持有') +
          `该股票。风险等级: ${riskAssessment.riskLevel}。`,
        confidence: avgConfidence
      };
      
      setFinalDecision(decision);
      
      setAnalysisSteps(prev => [
        ...prev.slice(0, -1),
        { 
          ...prev[prev.length - 1], 
          status: 'completed', 
          message: `最终决策: ${decision.decision}, 置信度: ${decision.confidence.toFixed(0)}%`
        }
      ]);
      
    } catch (err) {
      console.error('分析过程出错:', err);
      setError('分析过程中出现错误，请重试');
      setAnalysisSteps(prev => [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 1], status: 'error', message: '分析过程中出现错误' }
      ]);
    } finally {
      setAnalyzing(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">股票详细分析</h1>
          
          {/* 第一步：股票搜索区域 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">第一步：选择股票</h2>
            
            <div className="relative">
              <div className="flex mb-2">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入股票代码或名称..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  className="bg-blue-900 text-white px-4 py-2 rounded-r-md hover:bg-blue-800 transition-colors"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? '搜索中...' : '搜索'}
                </button>
              </div>
              
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full bg-white mt-1 border border-gray-300 rounded-md shadow-lg">
                  <ul>
                    {searchResults.map((result) => (
                      <li 
                        key={result}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectStock(result)}
                      >
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {showResults && searchResults.length === 0 && (
                <div className="text-gray-600 mt-2">
                  未找到结果，请尝试其他关键词
                </div>
              )}
            </div>
            
            {/* 已选股票信息 */}
            {stockData && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{stockData.quoteSummary?.longName || stockData.symbol}</h3>
                    <p className="text-gray-600">{stockData.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${stockData.price?.regularMarketPrice?.toFixed(2)}</p>
                    <p className={`${(stockData.price?.regularMarketChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(stockData.price?.regularMarketChange || 0) >= 0 ? '+' : ''}
                      {stockData.price?.regularMarketChange?.toFixed(2)} 
                      ({(stockData.price?.regularMarketChangePercent || 0) >= 0 ? '+' : ''}
                      {stockData.price?.regularMarketChangePercent?.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* OpenAI API Key 输入部分 */}
          {stockData && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">OpenAI API Key</h2>
                <button 
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showKeyInput ? '隐藏' : '显示'}
                </button>
              </div>
              
              {showKeyInput ? (
                <>
                  <p className="text-gray-600 mb-4">
                    使用Ben Graham策略需要OpenAI API Key。您可以在此输入您的API Key，它只会用于本次分析，不会被保存。
                  </p>
                  <div className="mb-4">
                    <input
                      type="text"
                      value={openAIKey}
                      onChange={(e) => {
                        setOpenAIKey(e.target.value);
                        setKeyError(null);
                      }}
                      placeholder="sk-..."
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {keyError && (
                      <p className="mt-2 text-red-600 text-sm">{keyError}</p>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      获取OpenAI API Key
                    </a>
                    <button
                      onClick={() => {
                        if (!openAIKey.trim().startsWith('sk-')) {
                          setKeyError('API Key格式不正确，应以sk-开头');
                          return;
                        }
                        setKeyError(null);
                        setShowKeyInput(false);
                      }}
                      className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                    >
                      确认
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-600">
                  {openAIKey ? '已设置API Key' : '未设置API Key，将使用基本分析算法'} 
                  {openAIKey && (
                    <span className="ml-2 text-sm text-green-600">
                      (已设置：{openAIKey.substring(0, 5)}...{openAIKey.substring(openAIKey.length - 4)})
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
          
          {/* 第二步：选择分析师 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">第二步：选择分析师</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <div 
                  key={agent.id}
                  className={`border p-4 rounded-md cursor-pointer transition-colors ${
                    agent.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onClick={() => toggleAgent(agent.id)}
                >
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`agent-${agent.id}`}
                      checked={agent.selected}
                      onChange={() => toggleAgent(agent.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 mr-2"
                      aria-label={`选择${agent.name}分析师`}
                    />
                    <label htmlFor={`agent-${agent.id}`} className="font-medium">{agent.name}</label>
                  </div>
                  <p className="text-sm text-gray-600">{agent.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* 第三步：分析按钮 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
            <h2 className="text-xl font-semibold mb-4">第三步：开始分析</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <button
              className="bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition-colors disabled:opacity-50"
              onClick={startAnalysis}
              disabled={!stockData || analyzing}
            >
              {analyzing ? '分析中...' : '分析股票'}
            </button>
          </div>
          
          {/* 第四步：分析过程与结果 */}
          {analysisSteps.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">第四步：分析过程与结果</h2>
              
              {/* 分析步骤展示 */}
              <div className="mb-8">
                <h3 className="font-medium text-lg mb-3">分析步骤</h3>
                <ul className="border rounded-md divide-y">
                  {analysisSteps.map((step, index) => (
                    <li key={index} className="p-4 flex items-center">
                      {step.status === 'waiting' && (
                        <span className="w-5 h-5 bg-gray-300 rounded-full mr-3"></span>
                      )}
                      {step.status === 'processing' && (
                        <span className="w-5 h-5 rounded-full mr-3 bg-blue-500 animate-pulse"></span>
                      )}
                      {step.status === 'completed' && (
                        <span className="w-5 h-5 bg-green-500 rounded-full mr-3 flex items-center justify-center text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                      {step.status === 'error' && (
                        <span className="w-5 h-5 bg-red-500 rounded-full mr-3 flex items-center justify-center text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                      )}
                      <div>
                        <p className="font-medium">{step.step}</p>
                        <p className="text-sm text-gray-600">{step.message}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* 分析师结果展示 */}
              {analysisResults.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-medium text-lg mb-3">分析师结果</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {analysisResults.map((result, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">{result.agent}的分析</h4>
                          <span className={`px-3 py-1 rounded-full text-white ${
                            result.decision === 'BUY' ? 'bg-green-500' :
                            result.decision === 'SELL' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}>
                            {result.decision}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{result.reasoning}</p>
                        
                        {/* 显示详细分析按钮（如果有） */}
                        {result.detailedAnalysis && (
                          <div className="mt-3">
                            <button 
                              onClick={() => {
                                // 创建一个临时元素，用于展示完整分析
                                const tempModal = document.createElement('div');
                                tempModal.className = 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4';
                                tempModal.innerHTML = `
                                  <div class="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto p-6">
                                    <div class="flex justify-between items-center mb-4">
                                      <h3 class="text-xl font-bold">${result.agent}的详细分析</h3>
                                      <button class="text-gray-500 hover:text-gray-700" id="close-modal">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                    <div class="prose max-w-none">
                                      <div class="whitespace-pre-wrap">
                                        ${result.detailedAnalysis?.replace(/\n/g, '<br>') || '无详细分析数据'}
                                      </div>
                                    </div>
                                  </div>
                                `;
                                document.body.appendChild(tempModal);
                                
                                // 添加关闭事件
                                document.getElementById('close-modal')?.addEventListener('click', () => {
                                  document.body.removeChild(tempModal);
                                });
                              }}
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <span>查看思考过程</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        )}
                        
                        {result.confidence && (
                          <div className="mt-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">置信度</span>
                              <span className="text-sm font-medium">{result.confidence.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  result.decision === 'BUY' ? 'bg-green-500' :
                                  result.decision === 'SELL' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}
                                style={{ width: `${result.confidence}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 最终决策展示 */}
              {finalDecision && (
                <div>
                  <h3 className="font-medium text-lg mb-3">最终决策</h3>
                  <div className="border-2 border-blue-900 rounded-md p-6 bg-blue-50">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xl font-bold">投资组合管理器决策</h4>
                      <span className={`px-4 py-2 rounded-full text-white text-lg font-bold ${
                        finalDecision.decision === 'BUY' ? 'bg-green-600' :
                        finalDecision.decision === 'SELL' ? 'bg-red-600' : 'bg-yellow-600'
                      }`}>
                        {finalDecision.decision === 'BUY' ? '买入' :
                         finalDecision.decision === 'SELL' ? '卖出' : '持有'}
                      </span>
                    </div>
                    <p className="text-gray-800 mb-4 text-lg">{finalDecision.reasoning}</p>
                    <div className="mt-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700">决策置信度</span>
                        <span className="font-medium">{finalDecision.confidence.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            finalDecision.decision === 'BUY' ? 'bg-green-600' :
                            finalDecision.decision === 'SELL' ? 'bg-red-600' : 'bg-yellow-600'
                          }`}
                          style={{ width: `${finalDecision.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 