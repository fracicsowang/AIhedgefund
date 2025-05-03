'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';
import { StockData } from '@/types';
import PortfolioManager from '../../components/PortfolioManager';

// Import analysis agents
import { benGrahamStrategy } from '@/agents/benGraham';

interface Agent {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

// Define the agent avatar mapping (legend images)
const agentAvatars: Record<string, string> = {
  benGraham: '/images/legends/graham.png',
  warrenBuffett: '/images/legends/buffett.png',
  billAckman: '/images/legends/ackman.png',
  cathieWood: '/images/legends/wood.png',
  charlieMunger: '/images/legends/munger.png',
  michaelBurry: '/images/legends/burry.png',
  peterLynch: '/images/legends/lynch.png',
  philFisher: '/images/legends/fisher.png',
  stanleyDruckenmiller: '/images/legends/druckenmiller.png',
};

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
  
  // Add OpenAI API Key related states
  const [openAIKey, setOpenAIKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  
  // Analysis process related states
  const [agents, setAgents] = useState<Agent[]>([
    { id: 'benGraham', name: 'Benjamin Graham', description: 'Father of value investing, focused on margin of safety and value stock selection', selected: true },
    { id: 'warrenBuffett', name: 'Warren Buffett', description: 'Focuses on economic moat and long-term competitive advantages', selected: false },
    { id: 'billAckman', name: 'Bill Ackman', description: 'Known for activist investing and concentrated bets on high-conviction ideas', selected: false },
    { id: 'cathieWood', name: 'Cathie Wood', description: 'Focuses on disruptive innovation and high-growth technology companies', selected: false },
    { id: 'charlieMunger', name: 'Charlie Munger', description: 'Advocates multidisciplinary thinking and long-term value investing', selected: false },
    { id: 'michaelBurry', name: 'Michael Burry', description: 'Famous for contrarian investing and deep fundamental analysis', selected: false },
    { id: 'peterLynch', name: 'Peter Lynch', description: 'Promotes investing in what you know and growth at a reasonable price', selected: false },
    { id: 'philFisher', name: 'Phil Fisher', description: 'Focuses on qualitative analysis and long-term growth stocks', selected: false },
    { id: 'stanleyDruckenmiller', name: 'Stanley Druckenmiller', description: 'Known for macro investing and dynamic asset allocation', selected: false },
  ]);
  const [analysisSteps, setAnalysisSteps] = useState<{step: string, status: 'waiting' | 'processing' | 'completed' | 'error', message: string}[]>([]);
  const [analysisResults, setAnalysisResults] = useState<{agent: string, decision: string, reasoning: string, confidence?: number, detailedAnalysis?: string}[]>([]);
  const [finalDecision, setFinalDecision] = useState<{decision: string, reasoning: string, confidence: number} | null>(null);
  
  const [analysisMode, setAnalysisMode] = useState<'portfolio' | 'single'>('single');
  
  // Update status when the symbol parameter in URL changes
  useEffect(() => {
    if (initialSymbol) {
      setSymbol(initialSymbol);
      setSearchInput(initialSymbol);
      fetchStockData(initialSymbol);
    }
  }, [initialSymbol]);
  
  // Simulate stock search
  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    
    try {
      // This can be replaced with an actual API call
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
      setError('Error searching for stocks');
      setLoading(false);
    }
  };
  
  // Select search result
  const selectStock = (selectedSymbol: string) => {
    setSymbol(selectedSymbol);
    setSearchInput(selectedSymbol);
    setShowResults(false);
    
    // Update URL to reflect selected stock
    router.push(`/stocks/analysis?symbol=${selectedSymbol}`);
    
    // Get stock data
    fetchStockData(selectedSymbol);
  };
  
  // Get stock data
  const fetchStockData = async (stockSymbol: string) => {
    try {
      setLoading(true);
      setError(null);
      setStockData(null); // Clear old data
      setAnalysisSteps([]); // Reset analysis steps
      setAnalysisResults([]); // Reset analysis results
      setFinalDecision(null); // Reset final decision

      // Call our API route
      const response = await fetch(`/api/stocks/${stockSymbol}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to get ${stockSymbol} data: ${response.statusText}`);
      }

      const data: StockData = await response.json();
      setStockData(data);
      
    } catch (error: any) {
      console.error('Failed to fetch stock data:', error);
      setError(error.message || 'Unknown error occurred while getting stock data');
      setStockData(null); // Ensure data is cleared on error
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle agent selection
  const toggleAgent = (agentId: string) => {
    setAgents(agents.map(agent => 
      agent.id === agentId ? { ...agent, selected: !agent.selected } : agent
    ));
  };
  
  // Start analysis process
  const startAnalysis = async () => {
    console.log('Button clicked');
    
    // Checkpoint 1: Stock data?
    if (!stockData) {
      setError('Please select a stock first');
      console.log('Exiting: No stock data selected.');
      return;
    }
    console.log('Checkpoint 1 Passed: Stock data exists.');

    // Checkpoint 2: Agents selected?
    const selectedAgents = agents.filter(agent => agent.selected);
    if (selectedAgents.length === 0) {
      setError('Please select at least one analyst');
      console.log('Exiting: No agents selected.');
      return;
    }
    console.log('Checkpoint 2 Passed: Agents selected.', selectedAgents);

    setAnalyzing(true);
    setError(null);
    setAnalysisSteps([]);
    setAnalysisResults([]);
    setFinalDecision(null);
    
    try {
      // Add console.log for debugging
      console.log('Starting analysis process');
      console.log('Selected stock data:', stockData);
      console.log('Selected agents:', selectedAgents);
      
      // Step 1: Initialize analysis process
      setAnalysisSteps(prev => [...prev, {
        step: 'Initialize Analysis Process',
        status: 'processing',
        message: 'Preparing analysis data...'
      }]);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalysisSteps(prev => [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 1], status: 'completed', message: 'Analysis data preparation complete' }
      ]);
      
      // Step 2: Analyst evaluation
      const allResults: { agent: string; decision: string; reasoning: string; confidence?: number; detailedAnalysis?: string }[] = [];
      for (const agent of selectedAgents) {
        setAnalysisSteps(prev => [...prev, {
          step: `${agent.name} Analysis`,
          status: 'processing',
          message: `${agent.name} is analyzing ${stockData.symbol}...`
        }]);
        
        // Simulate different analysis times
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
        
        // Get actual analysis results based on agent ID
        let result: { agent: string; decision: string; reasoning: string; confidence?: number; detailedAnalysis?: string } | undefined;
        if (agent.id === 'benGraham') {
          // Use actual Ben Graham agent
          try {
            // Add debug log before sending to backend
            console.log('[Frontend] stockData to be sent:', stockData);

            // Call API endpoint for analysis, passing user's API Key
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
              throw new Error(`Analysis request failed: ${response.statusText}`);
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
            console.error('Error executing Graham strategy:', error);
            result = {
              agent: agent.name,
              decision: 'HOLD',
              reasoning: 'Error occurred during analysis, recommend holding until more data is available.',
              confidence: 50
            };
          }
        } else if (agent.id === 'warrenBuffett') {
          try {
            console.log('[Frontend] stockData to be sent to Warren Buffett:', stockData);
            const response = await fetch('/api/agent-decision/warrenBuffett', {
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
              throw new Error(`Warren Buffett analysis request failed: ${response.statusText}`);
            }
            const buffettResult = await response.json();
            result = {
              agent: agent.name,
              decision: buffettResult.signal?.toUpperCase() || 'HOLD',
              reasoning: buffettResult.reasoning,
              confidence: buffettResult.confidence || (75 + Math.random() * 10),
              detailedAnalysis: buffettResult.detailedAnalysis
            };
          } catch (error) {
            console.error('Error executing Warren Buffett strategy:', error);
            result = {
              agent: agent.name,
              decision: 'HOLD',
              reasoning: 'Error occurred during Warren Buffett analysis, recommend holding until more data is available.',
              confidence: 50
            };
          }
        } else if (agent.id === 'billAckman') {
          try {
            console.log('[Frontend] stockData to be sent to Ackman:', stockData);
            const response = await fetch('/api/agent-decision/billAckman', {
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
              throw new Error(`Ackman analysis request failed: ${response.statusText}`);
            }
            const ackmanResult = await response.json();
            result = {
              agent: agent.name,
              decision: ackmanResult.signal?.toUpperCase() || 'HOLD',
              reasoning: ackmanResult.reasoning,
              confidence: ackmanResult.confidence || (75 + Math.random() * 10),
              detailedAnalysis: ackmanResult.detailedAnalysis
            };
          } catch (error) {
            console.error('Error executing Ackman strategy:', error);
            result = {
              agent: agent.name,
              decision: 'HOLD',
              reasoning: 'Error occurred during Ackman analysis, recommend holding until more data is available.',
              confidence: 50
            };
          }
        } else if (agent.id === 'cathieWood') {
          try {
            console.log('[Frontend] stockData to be sent to Cathie Wood:', stockData);
            const response = await fetch('/api/agent-decision/cathieWood', {
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
              throw new Error(`Cathie Wood analysis request failed: ${response.statusText}`);
            }
            const woodResult = await response.json();
            console.log('[Frontend] Cathie Wood API 返回:', woodResult);
            result = {
              agent: agent.name,
              decision: woodResult.signal?.toUpperCase() || 'HOLD',
              reasoning: woodResult.reasoning,
              confidence: woodResult.confidence || (75 + Math.random() * 10),
              detailedAnalysis: woodResult.detailedAnalysis
            };
          } catch (error) {
            console.error('Error executing Cathie Wood strategy:', error);
            result = {
              agent: agent.name,
              decision: 'HOLD',
              reasoning: 'Error occurred during Cathie Wood analysis, recommend holding until more data is available.',
              confidence: 50
            };
          }
        } else if (agent.id === 'charlieMunger') {
          try {
            console.log('[Frontend] stockData to be sent to Charlie Munger:', stockData);
            const response = await fetch('/api/agent-decision/charlieMunger', {
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
              throw new Error(`Charlie Munger analysis request failed: ${response.statusText}`);
            }
            const mungerResult = await response.json();
            console.log('[Frontend] Charlie Munger API 返回:', mungerResult);
            result = {
              agent: agent.name,
              decision: mungerResult.signal?.toUpperCase() || 'HOLD',
              reasoning: mungerResult.reasoning,
              confidence: mungerResult.confidence || (75 + Math.random() * 10),
              detailedAnalysis: mungerResult.detailedAnalysis
            };
          } catch (error) {
            console.error('Error executing Charlie Munger strategy:', error);
            result = {
              agent: agent.name,
              decision: 'HOLD',
              reasoning: 'Error occurred during Charlie Munger analysis, recommend holding until more data is available.',
              confidence: 50
            };
          }
        } else if (agent.id === 'michaelBurry') {
          try {
            console.log('[Frontend] stockData to be sent to Michael Burry:', stockData);
            const response = await fetch('/api/agent-decision/michaelBurry', {
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
              throw new Error(`Michael Burry analysis request failed: ${response.statusText}`);
            }
            const burryResult = await response.json();
            console.log('[Frontend] Michael Burry API 返回:', burryResult);
            result = {
              agent: agent.name,
              decision: burryResult.signal?.toUpperCase() || 'HOLD',
              reasoning: burryResult.reasoning,
              confidence: burryResult.confidence || (75 + Math.random() * 10),
              detailedAnalysis: burryResult.detailedAnalysis
            };
          } catch (error) {
            console.error('Error executing Michael Burry strategy:', error);
            result = {
              agent: agent.name,
              decision: 'HOLD',
              reasoning: 'Error occurred during Michael Burry analysis, recommend holding until more data is available.',
              confidence: 50
            };
          }
        } else if (agent.id === 'peterLynch') {
          try {
            console.log('[Frontend] stockData to be sent to Peter Lynch:', stockData);
            const response = await fetch('/api/agent-decision/peterLynch', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ticker: stockData.symbol,
                analysisData: stockData
              }),
            });
            if (!response.ok) {
              throw new Error(`Peter Lynch analysis request failed: ${response.statusText}`);
            }
            const lynchResult = await response.json();
            console.log('[Frontend] Peter Lynch API 返回:', lynchResult);
            result = {
              agent: agent.name,
              decision: lynchResult.signal?.toUpperCase() || 'HOLD',
              reasoning: lynchResult.reasoning,
              confidence: typeof lynchResult.confidence === 'number' ? lynchResult.confidence : (75 + Math.random() * 10),
              detailedAnalysis: lynchResult.detailedAnalysis
            };
          } catch (error) {
            console.error('Error executing Peter Lynch strategy:', error);
            result = {
              agent: agent.name,
              decision: 'HOLD',
              reasoning: 'Error occurred during Peter Lynch analysis, recommend holding until more data is available.',
              confidence: 50
            };
          }
        } else if (agent.id === 'philFisher') {
          try {
            console.log('[Frontend] stockData to be sent to Phil Fisher:', stockData);
            const response = await fetch('/api/agent-decision/philFisher', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ticker: stockData.symbol,
                analysisData: stockData
              }),
            });
            if (!response.ok) {
              throw new Error(`Phil Fisher analysis request failed: ${response.statusText}`);
            }
            const fisherResult = await response.json();
            console.log('[Frontend] Phil Fisher API 返回:', fisherResult);
            result = {
              agent: agent.name,
              decision: fisherResult.signal?.toUpperCase() || 'HOLD',
              reasoning: fisherResult.reasoning,
              confidence: typeof fisherResult.confidence === 'number' ? fisherResult.confidence : (75 + Math.random() * 10),
              detailedAnalysis: fisherResult.detailedAnalysis
            };
          } catch (error) {
            console.error('Error executing Phil Fisher strategy:', error);
            result = {
              agent: agent.name,
              decision: 'HOLD',
              reasoning: 'Error occurred during Phil Fisher analysis, recommend holding until more data is available.',
              confidence: 50
            };
          }
        } else if (agent.id === 'stanleyDruckenmiller') {
          try {
            console.log('[Frontend] stockData to be sent to Stanley Druckenmiller:', stockData);
            const response = await fetch('/api/agent-decision/stanleyDruckenmiller', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ticker: stockData.symbol,
                analysisData: stockData
              }),
            });
            if (!response.ok) {
              throw new Error(`Stanley Druckenmiller analysis request failed: ${response.statusText}`);
            }
            const druckResult = await response.json();
            console.log('[Frontend] Stanley Druckenmiller API 返回:', druckResult);
            result = {
              agent: agent.name,
              decision: druckResult.signal?.toUpperCase() || 'HOLD',
              reasoning: druckResult.reasoning,
              confidence: typeof druckResult.confidence === 'number' ? druckResult.confidence : (75 + Math.random() * 10),
              detailedAnalysis: druckResult.detailedAnalysis
            };
          } catch (error) {
            console.error('Error executing Stanley Druckenmiller strategy:', error);
            result = {
              agent: agent.name,
              decision: 'HOLD',
              reasoning: 'Error occurred during Stanley Druckenmiller analysis, recommend holding until more data is available.',
              confidence: 50
            };
          }
        } else {
          // Simulate results for other agents
          const decisions = ['BUY', 'SELL', 'HOLD'];
          const randomDecision = decisions[Math.floor(Math.random() * decisions.length)];
          
          result = {
            agent: agent.name,
            decision: randomDecision,
            reasoning: `Based on ${agent.id}'s analysis method, ${randomDecision === 'BUY' ? 'this stock shows investment value' : 
              randomDecision === 'SELL' ? 'this stock has risk factors' : 'holding and observing is recommended'}.`,
            confidence: 60 + Math.random() * 30
          };
        }
        
        if (result) {
          allResults.push(result);
        }
        setAnalysisSteps(prev => [
          ...prev.slice(0, -1),
          { 
            ...prev[prev.length - 1], 
            status: 'completed', 
            message: `${agent.name} analysis complete: ${result ? result.decision : 'N/A'}`
          }
        ]);
      }
      setAnalysisResults(allResults);
      
      // Step 3: Risk management
      setAnalysisSteps(prev => [...prev, {
        step: 'Risk Management Assessment',
        status: 'processing',
        message: 'Evaluating investment risk...'
      }]);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const riskAssessment = {
        riskLevel: Math.random() < 0.7 ? 'Moderate' : 'High',
        stopLoss: (stockData.price?.regularMarketPrice || 0) * 0.9,
        maxDrawdown: '10%'
      };
      
      setAnalysisSteps(prev => [
        ...prev.slice(0, -1),
        { 
          ...prev[prev.length - 1], 
          status: 'completed', 
          message: `Risk level: ${riskAssessment.riskLevel}, Recommended stop loss: $${riskAssessment.stopLoss.toFixed(2)}`
        }
      ]);
      
      // Step 4: Portfolio manager decision
      setAnalysisSteps(prev => [...prev, {
        step: 'Portfolio Management',
        status: 'processing',
        message: 'Generating final investment decision...'
      }]);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Count decisions and total confidence
      const decisionCounts = { BUY: 0, SELL: 0, HOLD: 0 };
      const decisionConfidence = { BUY: 0, SELL: 0, HOLD: 0 };
      allResults.forEach(result => {
        const decision = result.decision as keyof typeof decisionCounts;
        decisionCounts[decision]++;
        decisionConfidence[decision] += typeof result.confidence === 'number' ? result.confidence : 0;
      });
      
      // Find the most common decision
      let finalDecisionType = 'HOLD';
      let maxCount = 0;
      
      (Object.keys(decisionCounts) as Array<keyof typeof decisionCounts>).forEach(decision => {
        if (decisionCounts[decision] > maxCount) {
          maxCount = decisionCounts[decision];
          finalDecisionType = decision;
        } else if (decisionCounts[decision] === maxCount && 
                  decisionConfidence[decision] > decisionConfidence[finalDecisionType as keyof typeof decisionConfidence]) {
          // If counts are equal, choose the one with higher confidence
          finalDecisionType = decision;
        }
      });
      
      // Calculate average confidence
      let avgConfidence = 0;
      if (allResults.length === 1) {
        avgConfidence = typeof allResults[0].confidence === 'number' ? allResults[0].confidence : 0;
      } else {
        avgConfidence = decisionConfidence[finalDecisionType as keyof typeof decisionConfidence] /
          (decisionCounts[finalDecisionType as keyof typeof decisionCounts] || 1);
      }
      
      // Generate final decision object
      const decision = {
        decision: finalDecisionType,
        reasoning: `Based on assessments from ${allResults.length} analysts, considering all factors, the recommendation is to ` + 
          (finalDecisionType === 'BUY' ? 'buy' :
           finalDecisionType === 'SELL' ? 'sell' : 'hold') +
          ` this stock. Risk level: ${riskAssessment.riskLevel}.`,
        confidence: avgConfidence
      };
      
      setFinalDecision(decision);
      
      setAnalysisSteps(prev => [
        ...prev.slice(0, -1),
        { 
          ...prev[prev.length - 1], 
          status: 'completed', 
          message: `Final decision: ${decision.decision}, Confidence: ${decision.confidence.toFixed(0)}%`
        }
      ]);
      
    } catch (err) {
      console.error('Error in analysis process:', err);
      setError('An error occurred during analysis, please try again');
      setAnalysisSteps(prev => [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 1], status: 'error', message: 'Error during analysis process' }
      ]);
    } finally {
      setAnalyzing(false);
    }
  };
  
  // 新增：分析模式切换时拦截未登录用户
  const handleModeChange = (mode: 'portfolio' | 'single') => {
    if (mode === 'portfolio' && !user) {
      alert('Log in to use the portfolio analysis tool！');
      router.push('/login');
      return;
    }
    setAnalysisMode(mode);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Detailed Stock Analysis</h1>
          
          {/* Step 0: 分析模式选择 */}
          <div className="flex gap-4 mb-8">
            <button
              className={`px-4 py-2 rounded-md font-medium border ${analysisMode === 'portfolio' ? 'bg-blue-900 text-white' : 'bg-white text-blue-900 border-blue-900'}`}
              onClick={() => handleModeChange('portfolio')}
            >
              Portfolio Analysis
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium border ${analysisMode === 'single' ? 'bg-blue-900 text-white' : 'bg-white text-blue-900 border-blue-900'}`}
              onClick={() => handleModeChange('single')}
            >
              Single Stock Analysis
            </button>
          </div>
          
          {/* Step 1: 展示对应内容 */}
          {analysisMode === 'portfolio' ? (
            <div className="mb-8">
              <PortfolioManager user={user} />
            </div>
          ) : (
            <>
              {/* Step 1: Stock search area */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Step 1: Select a Stock</h2>
                
                <div className="relative">
                  <div className="flex mb-2">
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter stock code or name..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                      className="bg-blue-900 text-white px-4 py-2 rounded-r-md hover:bg-blue-800 transition-colors"
                      onClick={handleSearch}
                      disabled={loading}
                    >
                      {loading ? 'Searching...' : 'Search'}
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
                      No results found, please try other keywords
                    </div>
                  )}
                </div>
                
                {/* Selected stock information */}
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
              
              {/* Step 2: Select analysts */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Step 2: Select Analysts</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents.map((agent) => (
                    <div 
                      key={agent.id}
                      className={`border p-4 rounded-md cursor-pointer transition-colors ${
                        agent.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                      }`}
                      onClick={() => toggleAgent(agent.id)}
                    >
                      <div className="flex items-center mb-2">
                        <input 
                          type="checkbox" 
                          checked={agent.selected}
                          onChange={() => toggleAgent(agent.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          aria-label={`Select ${agent.name} analyst`}
                        />
                        {/* Display legend avatar */}
                        <img 
                          src={agentAvatars[agent.id] || '/images/legends/graham.png'} 
                          alt={agent.name} 
                          className="h-8 w-8 rounded-full object-cover ml-2 mr-2 border border-gray-300" 
                        />
                        <h3 className="text-lg font-medium">{agent.name}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">{agent.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Start analysis button */}
              <div className="text-center mb-8">
                <button
                  onClick={startAnalysis}
                  disabled={!stockData || analyzing}
                  className="bg-blue-900 text-white py-3 px-8 rounded-md hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
                >
                  {analyzing ? 'Analysis in Progress...' : 'Start Analysis'}
                </button>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                  </div>
                )}
              </div>
              
              {/* Analysis process display */}
              {analysisSteps.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4">Analysis Progress</h2>
                  
                  <div className="space-y-4">
                    {analysisSteps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                          step.status === 'completed' ? 'bg-green-100 text-green-600' :
                          step.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                          step.status === 'error' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {step.status === 'completed' && (
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {step.status === 'processing' && (
                            <div className="h-3 w-3 rounded-full bg-blue-600 animate-pulse"></div>
                          )}
                          {step.status === 'error' && (
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{step.step}</h4>
                          <p className="text-gray-600 text-sm">{step.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Analysis results */}
              {finalDecision && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-6">Analysis Results</h2>
                  
                  {/* Final decision card */}
                  <div className={`p-6 rounded-lg mb-8 ${
                    finalDecision.decision === 'BUY' ? 'bg-green-50 border border-green-200' :
                    finalDecision.decision === 'SELL' ? 'bg-red-50 border border-red-200' :
                    'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">Final Decision</h3>
                      <div className={`px-4 py-1 rounded-full font-medium ${
                        finalDecision.decision === 'BUY' ? 'bg-green-600 text-white' :
                        finalDecision.decision === 'SELL' ? 'bg-red-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}>
                        {finalDecision.decision}
                      </div>
                    </div>
                    
                    <p className="mb-4">{finalDecision.reasoning}</p>
                    
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-2">Confidence:</span>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div className={`h-2.5 rounded-full ${
                          finalDecision.confidence > 80 ? 'bg-green-600' :
                          finalDecision.confidence > 60 ? 'bg-blue-600' :
                          finalDecision.confidence > 40 ? 'bg-yellow-600' : 'bg-red-600'
                        }`} style={{ width: `${finalDecision.confidence}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{finalDecision.confidence.toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  {/* Individual analyst results */}
                  <h3 className="text-lg font-semibold mb-4">Analyst Opinions</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {analysisResults.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold">{result.agent}</h4>
                          <div className={`px-3 py-1 text-xs rounded-full font-medium ${
                            result.decision === 'BUY' ? 'bg-green-100 text-green-800' :
                            result.decision === 'SELL' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {result.decision}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-3">{result.reasoning}</p>
                        
                        {result.confidence && (
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">Confidence:</span>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                              <div className={`h-1.5 rounded-full ${
                                result.confidence > 80 ? 'bg-green-600' :
                                result.confidence > 60 ? 'bg-blue-600' :
                                result.confidence > 40 ? 'bg-yellow-600' : 'bg-red-600'
                              }`} style={{ width: `${result.confidence}%` }}></div>
                            </div>
                            <span className="text-xs font-medium">{result.confidence.toFixed(0)}%</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}