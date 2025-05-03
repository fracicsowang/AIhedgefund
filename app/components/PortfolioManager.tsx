import React, { useState, useEffect } from 'react';
import { Portfolio, Holding } from '@/types';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Console from 'react-display-console';

// mock data
const mockPortfolio: Portfolio = {
  cash: 20000,
  holdings: [
    { ticker: 'AAPL', shares: 100, cost_basis: 15000 },
    { ticker: 'TSLA', shares: 50, cost_basis: 12000 },
  ],
};

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

// 大师Agent列表
const AGENT_LIST = [
  { id: 'benGraham', name: 'Benjamin Graham', description: 'Father of value investing, focused on margin of safety and value stock selection' },
  { id: 'warrenBuffett', name: 'Warren Buffett', description: 'Focuses on economic moat and long-term competitive advantages' },
  { id: 'billAckman', name: 'Bill Ackman', description: 'Known for activist investing and concentrated bets on high-conviction ideas' },
  { id: 'cathieWood', name: 'Cathie Wood', description: 'Focuses on disruptive innovation and high-growth technology companies' },
  { id: 'charlieMunger', name: 'Charlie Munger', description: 'Advocates multidisciplinary thinking and long-term value investing' },
  { id: 'michaelBurry', name: 'Michael Burry', description: 'Famous for contrarian investing and deep fundamental analysis' },
  { id: 'peterLynch', name: 'Peter Lynch', description: 'Promotes investing in what you know and growth at a reasonable price' },
  { id: 'philFisher', name: 'Phil Fisher', description: 'Focuses on qualitative analysis and long-term growth stocks' },
  { id: 'stanleyDruckenmiller', name: 'Stanley Druckenmiller', description: 'Known for macro investing and dynamic asset allocation' },
];

interface PortfolioManagerProps {
  user?: User | null;
}

export default function PortfolioManager({ user }: PortfolioManagerProps) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newHolding, setNewHolding] = useState<Holding>({ ticker: '', shares: 0, cost_basis: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<Holding>({ ticker: '', shares: 0, cost_basis: 0 });
  const [formError, setFormError] = useState<string | null>(null);
  const [editingCash, setEditingCash] = useState(false);
  const [cashInput, setCashInput] = useState(portfolio?.cash ?? 0);
  const [cashError, setCashError] = useState<string | null>(null);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['benGraham', 'warrenBuffett']);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0); // 0:未开始 1:大师 2:风控 3:组合 4:最终
  const [analysisResults, setAnalysisResults] = useState<any[]>([]); // 后续结构细化
  const [riskResult, setRiskResult] = useState<any>(null);
  const [portfolioResult, setPortfolioResult] = useState<any>(null);
  const [finalSuggestion, setFinalSuggestion] = useState<any>(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState<string | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [finalReport, setFinalReport] = useState<any>(null);
  const [finalReportLoading, setFinalReportLoading] = useState(false);
  const [finalReportError, setFinalReportError] = useState<string | null>(null);
  const [showConsole, setShowConsole] = useState(false);

  // Fetch portfolio from database
  useEffect(() => {
    if (!user) {
      setPortfolio(mockPortfolio);
      return;
    }
    setLoading(true);
    setError(null);
    supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('No rows')) {
            setPortfolio(null); // No portfolio
          } else {
            setError('Failed to fetch portfolio data');
          }
        } else if (data) {
          setPortfolio({ cash: data.cash, holdings: data.holdings || [] });
        } else {
          setPortfolio(null);
        }
      })
      .catch(() => setError('Failed to fetch portfolio data'))
      .finally(() => setLoading(false));
  }, [user]);

  // Add holding (below table)
  const addHolding = async () => {
    if (!newHolding.ticker || newHolding.shares <= 0 || newHolding.cost_basis <= 0 || !user || !portfolio) {
      setFormError('Please fill in all fields with valid values');
      console.log('Add holding failed:', { newHolding, user, portfolio });
      return;
    }
    setFormError(null);
    setLoading(true);
    try {
      const holdings = [...portfolio.holdings, { ...newHolding }];
      await supabase
        .from('portfolios')
        .update({ holdings })
        .eq('user_id', user.id);
      setPortfolio({ ...portfolio, holdings });
      setNewHolding({ ticker: '', shares: 0, cost_basis: 0 });
    } catch (e) {
      setFormError('Failed to add holding, please try again');
      console.error('Add holding error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Delete holding
  const deleteHolding = async (ticker: string) => {
    if (!user || !portfolio) return;
    setLoading(true);
    try {
      const holdings = portfolio.holdings.filter(h => h.ticker !== ticker);
      await supabase
        .from('portfolios')
        .update({ holdings })
        .eq('user_id', user.id);
      setPortfolio({ ...portfolio, holdings });
    } finally {
      setLoading(false);
    }
  };

  // Edit holding
  const updateHolding = async (idx: number, field: keyof Holding, value: string | number) => {
    if (!user || !portfolio) return;
    const holdings = [...portfolio.holdings];
    holdings[idx] = { ...holdings[idx], [field]: value };
    setPortfolio({ ...portfolio, holdings });
    setLoading(true);
    try {
      await supabase
        .from('portfolios')
        .update({ holdings })
        .eq('user_id', user.id);
    } finally {
      setLoading(false);
    }
  };

  // Create holding form submit
  const handleCreateHolding = async () => {
    if (!createForm.ticker || createForm.shares <= 0 || createForm.cost_basis <= 0) {
      setFormError('Please fill in all fields with valid values');
      return;
    }
    setFormError(null);
    if (!user) return;
    setLoading(true);
    try {
      // Check if portfolio exists
      const { data: existing, error: fetchError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .single();
      let newPortfolio: Portfolio;
      if (existing) {
        // Exists, append holding
        const holdings = [...(existing.holdings || []), createForm];
        newPortfolio = { cash: existing.cash, holdings };
        await supabase
          .from('portfolios')
          .update({ holdings })
          .eq('user_id', user.id);
      } else {
        // Not exists, create new
        newPortfolio = { cash: 0, holdings: [createForm] };
        await supabase
          .from('portfolios')
          .insert([{ user_id: user.id, cash: 0, holdings: [createForm] }]);
      }
      setPortfolio(newPortfolio);
      setShowCreateModal(false);
      setCreateForm({ ticker: '', shares: 0, cost_basis: 0 });
    } catch (e) {
      setFormError('Failed to save, please try again');
    } finally {
      setLoading(false);
    }
  };

  // Save cash
  const handleSaveCash = async () => {
    if (!user) return;
    if (cashInput < 0) {
      setCashError('Cash balance cannot be negative');
      return;
    }
    setCashError(null);
    setLoading(true);
    try {
      await supabase
        .from('portfolios')
        .update({ cash: cashInput })
        .eq('user_id', user.id);
      setPortfolio(prev => prev ? { ...prev, cash: cashInput } : prev);
      setEditingCash(false);
    } catch {
      setCashError('Failed to save, please try again');
    } finally {
      setLoading(false);
    }
  };

  // Analysis button click
  const handleStartAgentPanel = () => {
    setShowAgentPanel(true);
  };

  // Select/unselect agent
  const toggleAgent = (id: string) => {
    setSelectedAgents(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  // Real API call for agent analysis
  const handleStartAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisStep(1);
    const allResults: any[] = [];
    // 1. First, get complete StockData for all holdings
    const stockDataMap: Record<string, any> = {};
    for (const holding of portfolio!.holdings) {
      try {
        const resp = await fetch(`/api/stocks/${holding.ticker}`);
        const stockData = await resp.json();
        stockDataMap[holding.ticker] = stockData;
      } catch (e) {
        console.error(`[StockData获取失败] ${holding.ticker}`, e);
        stockDataMap[holding.ticker] = null;
      }
    }
    // 2. Pass complete StockData to each agent
    for (const holding of portfolio!.holdings) {
      const stockData = stockDataMap[holding.ticker];
      if (!stockData) {
        // If failed to get, directly fallback
        for (const agentId of selectedAgents) {
          allResults.push({
            agent: AGENT_LIST.find(a => a.id === agentId)?.name,
            ticker: holding.ticker,
            decision: 'HOLD',
            confidence: 50,
            reasoning: '股票数据获取失败，无法分析',
          });
        }
        continue;
      }
      for (const agentId of selectedAgents) {
        let postData: any;
        if (["peterLynch", "philFisher", "stanleyDruckenmiller"].includes(agentId)) {
          postData = {
            ticker: holding.ticker,
            analysisData: stockData
          };
        } else {
          postData = {
            stockData: stockData
          };
        }
        // Debug log: Request before
        console.log('[Agent分析] 请求 Agent:', agentId, 'URL:', `/api/agent-decision/${agentId}`, 'postData:', postData);
        try {
          const response = await fetch(`/api/agent-decision/${agentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
          });
          const data = await response.json();
          // Debug log: Response content
          console.log('[Agent分析] Agent:', agentId, '响应:', data);
          allResults.push({
            agent: AGENT_LIST.find(a => a.id === agentId)?.name,
            ticker: holding.ticker,
            decision: data.decision || data.signal || 'HOLD',
            confidence: data.confidence || 75,
            reasoning: data.reasoning || 'No detailed reasoning provided',
          });
        } catch (e) {
          // Debug log: Exception content
          console.error('[Agent分析异常]', agentId, e);
          allResults.push({
            agent: AGENT_LIST.find(a => a.id === agentId)?.name,
            ticker: holding.ticker,
            decision: 'HOLD',
            confidence: 50,
            reasoning: 'Analysis failed',
          });
        }
      }
    }
    setAnalysisResults(allResults);
    setAnalysisStep(2);
    // Step 2: Risk analysis (remove mock, no automatic assignment of riskResult)
    // User needs to manually click the risk analysis button to call the real API
  };

  // Risk analysis button click
  const handleRiskAnalysis = async () => {
    setRiskLoading(true);
    setRiskError(null);
    try {
      const resp = await fetch('/api/agent-decision/riskManager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio,
          tickers: portfolio!.holdings.map(h => h.ticker),
        }),
      });
      const data = await resp.json();
      console.log('[RiskManager] API返回数据:', data);
      if (resp.ok) {
        setRiskResult(data);
        console.log('[RiskManager] setRiskResult后:', data);
        setAnalysisStep(3); // Enter next step
      } else {
        setRiskError(data.error || 'Risk analysis failed');
      }
    } catch (e: any) {
      setRiskError(e?.message || 'Risk analysis failed');
    } finally {
      setRiskLoading(false);
    }
  };

  // Portfolio manager analysis button click
  const handlePortfolioAnalysis = async () => {
    setPortfolioLoading(true);
    setPortfolioError(null);
    try {
      // Build analystSignals
      const analystSignals: Record<string, any> = {};
      // 1. Summarize agent analysis results
      for (const agent of selectedAgents) {
        analystSignals[agent] = {};
        for (const r of analysisResults) {
          if (r.agent && r.ticker && AGENT_LIST.find(a => a.name === r.agent)?.id === agent) {
            analystSignals[agent][r.ticker] = {
              signal: r.decision,
              confidence: r.confidence,
            };
          }
        }
      }
      // 2. Risk analysis results
      analystSignals['risk_manager'] = riskResult;
      // 3. Get apiKey (assume backend automatically injects or uses environment variable, here pass empty string)
      const resp = await fetch('/api/agent-decision/portfolioManager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio,
          analystSignals,
          tickers: portfolio!.holdings.map(h => h.ticker),
          apiKey: '',
        }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setPortfolioResult(data);
        setAnalysisStep(4); // Enter final suggestion
      } else {
        setPortfolioError(data.error || '组合分析失败');
      }
    } catch (e: any) {
      setPortfolioError(e?.message || '组合分析异常');
    } finally {
      setPortfolioLoading(false);
    }
  };

  // Get final report
  const handleGetFinalReport = async () => {
    setFinalReportLoading(true);
    setFinalReportError(null);
    try {
      // Build analystSignals
      const analystSignals: Record<string, any> = {};
      for (const agent of selectedAgents) {
        analystSignals[agent] = {};
        for (const r of analysisResults) {
          if (r.agent && r.ticker && AGENT_LIST.find(a => a.name === r.agent)?.id === agent) {
            analystSignals[agent][r.ticker] = {
              signal: r.decision,
              confidence: r.confidence,
            };
          }
        }
      }
      analystSignals['risk_manager'] = riskResult;
      const resp = await fetch('/api/agent-decision/finalAdvisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio,
          analystSignals,
          portfolioManagerResult: portfolioResult,
          riskManagerResult: riskResult,
        }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setFinalReport(data);
      } else {
        setFinalReportError(data.error || '获取最终报告失败');
      }
    } catch (e: any) {
      setFinalReportError(e?.message || '获取最终报告异常');
    } finally {
      setFinalReportLoading(false);
    }
  };

  // Display logic
  if (loading) return <div>Loading portfolio data...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!portfolio || portfolio.holdings.length === 0)
    return (
      <>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-gray-600 text-xl mb-4">No holdings yet</div>
          <div className="mb-6 text-gray-500">You have no holdings. Click the button below to add one!</div>
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-lg font-medium"
            onClick={() => setShowCreateModal(true)}
          >
            Add Holding
          </button>
          {showCreateModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-96 relative">
                <h3 className="text-xl font-bold mb-4">Add Holding</h3>
                <div className="mb-3">
                  <input
                    className="border px-3 py-2 rounded w-full mb-1"
                    placeholder="e.g. AAPL"
                    value={createForm.ticker}
                    onChange={e => setCreateForm({ ...createForm, ticker: e.target.value.toUpperCase() })}
                    maxLength={8}
                    pattern="[A-Z0-9]+"
                  />
                  {createForm.ticker === '' && <div className="text-red-600 text-xs mb-1">Ticker is required</div>}
                  <input
                    type="number"
                    value={createForm.shares}
                    onChange={e => setCreateForm({ ...createForm, shares: Number(e.target.value) })}
                    className="border px-3 py-2 rounded w-full mb-1"
                    placeholder="Shares"
                    aria-label="Shares"
                  />
                  {createForm.shares <= 0 && <div className="text-red-600 text-xs mb-1">Shares must be greater than 0</div>}
                  <input
                    className="border px-3 py-2 rounded w-full mb-1"
                    placeholder="Total cost, e.g. 15000"
                    type="number"
                    min={1}
                    value={createForm.cost_basis}
                    onChange={e => setCreateForm({ ...createForm, cost_basis: Number(e.target.value) })}
                  />
                  {createForm.cost_basis <= 0 && <div className="text-red-600 text-xs mb-1">Cost must be greater than 0</div>}
                  {formError && <div className="text-red-600 text-sm mb-2">{formError}</div>}
                </div>
                <div className="flex justify-end gap-4">
                  <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleCreateHolding}
                    disabled={
                      !createForm.ticker || createForm.shares <= 0 || createForm.cost_basis <= 0
                    }
                  >Save</button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* 日志面板 */}
        {showConsole && (
          <div
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              background: 'rgba(30,30,30,0.98)',
              height: '14.3vh',
              maxHeight: '14.3vh',
              overflowY: 'auto',
            }}
          >
            <Console input theme="dark" />
          </div>
        )}
        {/* 右下角悬浮按钮 */}
        <button
          style={{
            position: 'fixed',
            right: 24,
            bottom: showConsole ? 220 : 24,
            zIndex: 10000,
            borderRadius: '50%',
            width: 48,
            height: 48,
            background: '#222',
            color: '#fff',
            fontSize: 28,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
          onClick={() => setShowConsole(v => !v)}
          title={showConsole ? '关闭日志面板' : '打开日志面板'}
        >
          {showConsole ? '×' : '>'}
        </button>
      </>
    );

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 py-10">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-[1494px] mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">My Portfolio</h2>
          <div className="mb-6 flex items-center gap-4">
            <span className="font-medium">Cash Balance:</span>
            {editingCash ? (
              <>
                <input
                  type="number"
                  className="border px-2 py-1 rounded w-32 mr-2"
                  value={cashInput}
                  min={0}
                  onChange={e => setCashInput(Number(e.target.value))}
                  placeholder="Cash Balance"
                  aria-label="Cash Balance"
                />
                <button className="px-3 py-1 bg-blue-600 text-white rounded mr-2" onClick={handleSaveCash}>Save</button>
                <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => { setEditingCash(false); setCashInput(portfolio.cash); }}>Cancel</button>
                {cashError && <span className="text-red-600 text-xs ml-2">{cashError}</span>}
              </>
            ) : (
              <>
                <span>${portfolio.cash}</span>
                <button className="ml-2 px-3 py-1 bg-gray-200 rounded" onClick={() => setEditingCash(true)}>Edit</button>
              </>
            )}
          </div>

          {/* Portfolio Table */}
          <table className="min-w-full divide-y divide-gray-200 mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4">Ticker</th>
                <th className="py-2 px-4">Shares</th>
                <th className="py-2 px-4">Cost</th>
                <th className="py-2 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.holdings.map((h, idx) => (
                <tr key={h.ticker} className="border-b last:border-b-0">
                  <td className="py-2 px-4">
                    <input
                      value={h.ticker}
                      onChange={e => updateHolding(idx, 'ticker', e.target.value.toUpperCase())}
                      className="border rounded px-2 py-1 w-24"
                      placeholder="Ticker"
                      aria-label="Ticker"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      value={h.shares}
                      onChange={e => updateHolding(idx, 'shares', Number(e.target.value))}
                      className="border rounded px-2 py-1 w-20"
                      placeholder="Shares"
                      aria-label="Shares"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      value={h.cost_basis}
                      onChange={e => updateHolding(idx, 'cost_basis', Number(e.target.value))}
                      className="border rounded px-2 py-1 w-28"
                      placeholder="Cost"
                      aria-label="Cost"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <button onClick={() => deleteHolding(h.ticker)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="py-2 px-4">
                  <input
                    value={newHolding.ticker}
                    onChange={e => setNewHolding({ ...newHolding, ticker: e.target.value.toUpperCase() })}
                    placeholder="Ticker"
                    className="border rounded px-2 py-1 w-24"
                    aria-label="Ticker"
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="number"
                    value={newHolding.shares}
                    onChange={e => setNewHolding({ ...newHolding, shares: Number(e.target.value) })}
                    placeholder="Shares"
                    className="border rounded px-2 py-1 w-20"
                    aria-label="Shares"
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="number"
                    value={newHolding.cost_basis}
                    onChange={e => setNewHolding({ ...newHolding, cost_basis: Number(e.target.value) })}
                    placeholder="Cost"
                    className="border rounded px-2 py-1 w-28"
                    aria-label="Cost"
                  />
                </td>
                <td className="py-2 px-4">
                  {formError && <div className="text-red-600 text-sm mb-2">{formError}</div>}
                  <button onClick={addHolding} className="text-green-600 hover:underline">Add</button>
                </td>
              </tr>
            </tbody>
          </table>
          {/* Start Agent Analysis 按钮移动到表格下方 */}
          <div className="text-center mb-8">
            <button
              onClick={handleStartAgentPanel}
              disabled={loading || portfolio.holdings.length === 0}
              className="bg-blue-900 text-white py-3 px-8 rounded-md hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
            >
              {loading ? 'Analysis in Progress...' : 'Start Agent Analysis'}
            </button>
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>

          {/* Agent selection area */}
          {showAgentPanel && !analyzing && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-5xl mx-auto">
              <h3 className="text-xl font-bold mb-4">Select Analysis Agent</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {AGENT_LIST.map(agent => (
                  <div
                    key={agent.id}
                    className={`border p-4 rounded-lg cursor-pointer transition-colors flex flex-col justify-between h-full ${selectedAgents.includes(agent.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}
                    onClick={() => toggleAgent(agent.id)}
                    style={{ minHeight: 120 }}
                  >
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        checked={selectedAgents.includes(agent.id)}
                        onChange={() => toggleAgent(agent.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <img
                        src={agentAvatars[agent.id] || '/images/legends/graham.png'}
                        alt={agent.name}
                        className="h-8 w-8 rounded-full object-cover ml-2 mr-2 border border-gray-300"
                      />
                      <h4 className="text-lg font-semibold">{agent.name}</h4>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{agent.description}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  className="bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-bold shadow hover:bg-blue-800 transition"
                  onClick={handleStartAnalysis}
                >
                  Start Analysis
                </button>
              </div>
            </div>
          )}

          {/* Analysis process step-by-step display */}
          {analyzing && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-5xl mx-auto">
              <h3 className="text-xl font-bold mb-6">Analysis Progress</h3>
              <div className="flex flex-col gap-6">
                {/* Step 1: Agent analysis display, support multiple stocks */}
                <div className={`p-4 rounded-lg border ${analysisStep >= 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <h4 className="font-semibold mb-2">1. Agent Analysis</h4>
                  {analysisStep === 1 && <div className="text-blue-600 animate-pulse">Analyzing...</div>}
                  {analysisStep > 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisResults.map((r, idx) => (
                        <div key={idx} className="border rounded-lg p-4 bg-white">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold">{r.agent} - {r.ticker}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{r.decision}</span>
                          </div>
                          <div className="text-gray-600 text-sm mb-1">Confidence: {r.confidence?.toFixed(0)}%</div>
                          <div className="text-gray-500 text-xs">{r.reasoning}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Step 2: Risk analysis */}
                <div className={`p-4 rounded-lg border ${analysisStep >= 2 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <h4 className="font-semibold mb-2">2. Risk Analysis</h4>
                  {/* Button appears after analysis is completed */}
                  {analysisStep === 2 && !riskResult && !riskLoading && (
                    <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold" onClick={handleRiskAnalysis}>Start RiskManager risk analysis</button>
                  )}
                  {riskLoading && <div className="text-blue-600 animate-pulse">Risk analysis in progress...</div>}
                  {riskError && <div className="text-red-600 text-sm">{riskError}</div>}
                  {/* Display risk analysis results */}
                  {riskResult && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {Object.entries(riskResult).map(([ticker, res]: any) => (
                        <div key={ticker} className="border rounded-lg p-4 bg-white">
                          <div className="font-bold mb-1">{ticker}</div>
                          {res && res.reasoning ? (
                            <>
                              <div className="text-gray-700 text-sm mb-1">Current price: ${res.current_price}</div>
                              <div className="text-gray-700 text-sm mb-1">Maximum buyable amount: ${res.remaining_position_limit}</div>
                              <div className="text-gray-500 text-xs">
                                Total assets: ${res.reasoning.portfolio_value}，Position cost: ${res.reasoning.current_position}，
                                Single ticket limit: ${res.reasoning.position_limit}，Remaining limit: ${res.reasoning.remaining_limit}，
                                Available cash: ${res.reasoning.available_cash}
                              </div>
                            </>
                          ) : (
                            <div className="text-red-600 text-sm">Risk analysis data missing</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Step 3: Portfolio suggestion */}
                <div className={`p-4 rounded-lg border ${analysisStep >= 3 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <h4 className="font-semibold mb-2">3. Portfolio Suggestion</h4>
                  {/* Button appears after risk analysis is completed */}
                  {analysisStep === 3 && !portfolioResult && !portfolioLoading && (
                    <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold" onClick={handlePortfolioAnalysis}>Start Portfolio Manager analysis</button>
                  )}
                  {portfolioLoading && <div className="text-blue-600 animate-pulse">Portfolio analysis in progress...</div>}
                  {portfolioError && <div className="text-red-600 text-sm">{portfolioError}</div>}
                  {/* Display portfolio analysis results */}
                  {portfolioResult && portfolioResult.decisions && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {Object.entries(portfolioResult.decisions).map(([ticker, res]: any) => (
                        <div key={ticker} className="border rounded-lg p-4 bg-white">
                          <div className="font-bold mb-1">{ticker}</div>
                          <div className="text-gray-700 text-sm mb-1">Action suggestion: {res.action}，Quantity: {res.quantity}</div>
                          <div className="text-gray-700 text-sm mb-1">Confidence: {res.confidence}</div>
                          <div className="text-gray-500 text-xs">Reason: {res.reasoning}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Step 4: Final suggestion */}
                <div className={`p-4 rounded-lg border ${analysisStep === 4 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <h4 className="font-semibold mb-2">4. Final Suggestion</h4>
                  {/* Get final report button */}
                  {analysisStep === 4 && portfolioResult && !finalReport && !finalReportLoading && (
                    <button className="bg-blue-700 text-white px-6 py-2 rounded font-bold" onClick={handleGetFinalReport}>Get Final Report</button>
                  )}
                  {finalReportLoading && <div className="text-blue-600 animate-pulse">Final report generation in progress...</div>}
                  {finalReportError && <div className="text-red-600 text-sm">{finalReportError}</div>}
                  {finalReport && (
                    <div className="mt-4">
                      <div className="text-gray-900 text-base font-bold mb-2">{finalReport.summary}</div>
                      <div className="text-gray-700 text-sm mb-2">Risk reminder: {finalReport.risk}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {finalReport.actions && finalReport.actions.length > 0 ? finalReport.actions.map((a: any, idx: number) => (
                          <div key={idx} className="border rounded-lg p-4 bg-white">
                            <div className="font-bold mb-1">{a.ticker}</div>
                            <div className="text-gray-700 text-sm mb-1">Suggestion: {a.suggestion}，Quantity: {a.quantity}</div>
                            <div className="text-gray-500 text-xs">Reason: {a.reason}</div>
                          </div>
                        )) : <div className="text-gray-500 text-sm">No specific action suggestion</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 日志面板 */}
      {showConsole && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: 'rgba(30,30,30,0.98)',
            height: '14.3vh', // 1/7 屏幕高度
            maxHeight: '14.3vh',
            overflowY: 'auto',
          }}
        >
          <Console input theme="dark" />
        </div>
      )}

      {/* 右下角悬浮按钮 */}
      <button
        style={{
          position: 'fixed',
          right: 24,
          bottom: showConsole ? 220 : 24,
          zIndex: 10000,
          borderRadius: '50%',
          width: 48,
          height: 48,
          background: '#222',
          color: '#fff',
          fontSize: 28,
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
        onClick={() => setShowConsole(v => !v)}
        title={showConsole ? '关闭日志面板' : '打开日志面板'}
      >
        {showConsole ? '×' : '>'}
      </button>
    </>
  );
} 