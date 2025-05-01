import React, { useState } from 'react';
import { Box, Grid, Button, TextField, Typography, Alert, Paper, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InvestmentAgentCard, { AgentType, getAgentAnalysis } from './InvestmentAgentCard';
import { StockData } from '@/types';

// 示例股票数据
const exampleStock: StockData = {
  symbol: 'AAPL',
  price: {
    regularMarketPrice: 170.50,
    regularMarketChange: 2.30,
    regularMarketChangePercent: 1.35,
    regularMarketDayHigh: 172.10,
    regularMarketDayLow: 169.20,
    regularMarketVolume: 67500000
  },
  quoteSummary: {
    longName: 'Apple Inc.',
    defaultKeyStatistics: {
      forwardPE: {
        raw: 28.5,
        fmt: '28.50'
      },
      priceToBook: {
        raw: 43.38,
        fmt: '43.38'
      },
      returnOnEquity: {
        raw: 0.31,
        fmt: '31.00%'
      },
      debtToEquity: {
        raw: 1.76,
        fmt: '1.76'
      },
      profitMargins: {
        raw: 0.243,
        fmt: '24.30%'
      }
    },
    financialData: {
      totalCash: {
        raw: 62500000000,
        fmt: '62.5B'
      },
      totalDebt: {
        raw: 120000000000,
        fmt: '120B'
      },
      operatingCashflow: {
        raw: 82000000000,
        fmt: '82B'
      },
      revenueGrowth: {
        raw: 0.08,
        fmt: '8.00%'
      },
      earningsGrowth: {
        raw: 0.05,
        fmt: '5.00%'
      }
    }
  },
  technicalIndicators: {
    rsi: 58.5,
    macd: {
      macdLine: 3.2,
      signalLine: 2.7,
      histogram: 0.5
    },
    movingAverages: {
      ma50: 168.75,
      ma200: 160.20
    }
  },
  sentiment: {
    bearishPercent: 25,
    bullishPercent: 75,
    newsScore: 0.65
  }
};

interface AgentResult {
  decision: string;
  reasoning: string;
  confidence?: number;
}

interface StockAnalysisProps {
  stockData?: StockData;
}

const StockAnalysis: React.FC<StockAnalysisProps> = ({ stockData = exampleStock }) => {
  // 状态
  const [results, setResults] = useState<{[key in AgentType]?: AgentResult | null}>({});
  const [loading, setLoading] = useState<{[key in AgentType]?: boolean}>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [openAIKey, setOpenAIKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  // 可用的代理类型
  const agentTypes: AgentType[] = ['benGraham', 'buffett', 'riskManager'];
  
  // 运行分析
  const runAnalysis = async (agentType: AgentType) => {
    setError(null);
    setLoading(prev => ({ ...prev, [agentType]: true }));
    
    try {
      // 使用getAgentAnalysis函数获取分析结果，传递API密钥
      const result = await getAgentAnalysis(agentType, stockData, openAIKey);
      setResults(prev => ({ ...prev, [agentType]: result }));
    } catch (err: any) {
      console.error(`分析失败: ${err.message}`);
      setError(`${agentType} 分析失败: ${err.message}`);
      setResults(prev => ({ ...prev, [agentType]: null }));
    } finally {
      setLoading(prev => ({ ...prev, [agentType]: false }));
    }
  };
  
  // 运行所有分析
  const runAllAnalyses = async () => {
    setError(null);
    
    // 为所有代理类型设置加载状态
    const loadingState = agentTypes.reduce((acc, type) => ({ ...acc, [type]: true }), {});
    setLoading(loadingState);
    
    try {
      // 并行运行所有分析
      const analysisPromises = agentTypes.map(type => 
        getAgentAnalysis(type, stockData, openAIKey)
          .then(result => ({ type, result }))
          .catch(err => {
            console.error(`${type} 分析失败:`, err);
            return { type, result: null, error: err };
          })
      );
      
      const results = await Promise.all(analysisPromises);
      
      // 更新结果状态
      const newResults = results.reduce((acc, { type, result }) => {
        return { ...acc, [type]: result };
      }, {});
      
      setResults(newResults);
      
      // 检查是否有错误
      const errors = results.filter(r => 'error' in r);
      if (errors.length > 0) {
        setError(`${errors.length}个代理分析失败。请查看控制台了解详情。`);
      }
    } catch (err: any) {
      console.error('分析过程中出错:', err);
      setError(`分析失败: ${err.message}`);
    } finally {
      // 重置所有加载状态
      const notLoadingState = agentTypes.reduce((acc, type) => ({ ...acc, [type]: false }), {});
      setLoading(notLoadingState);
    }
  };
  
  // 处理代理卡片点击
  const handleAgentClick = (agentType: AgentType) => {
    if (loading[agentType]) return;
    
    // 如果已有结果，设为选中
    if (results[agentType]) {
      setSelectedAgent(selectedAgent === agentType ? null : agentType);
    } else {
      // 否则运行分析
      runAnalysis(agentType);
    }
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {stockData.quoteSummary?.longName || stockData.symbol}
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              当前价格: ${stockData.price.regularMarketPrice?.toFixed(2)} | 
              P/E: {stockData.quoteSummary?.defaultKeyStatistics?.forwardPE?.raw?.toFixed(2)} | 
              行业: {stockData.symbol.slice(0,1) === 'A' ? '科技' : '金融'}
            </Typography>
          </Grid>
        </Grid>
        
        {/* API密钥输入 */}
        <Box sx={{ mb: 3 }}>
          <TextField
            label="OpenAI API密钥 (可选，用于更详细的分析)"
            variant="outlined"
            fullWidth
            value={openAIKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOpenAIKey(e.target.value)}
            type={showApiKey ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowApiKey(!showApiKey)}
                    edge="end"
                  >
                    {showApiKey ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText="您的API密钥不会被存储，仅在此会话中用于AI分析"
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button 
            variant="contained" 
            color="primary"
            size="large"
            onClick={runAllAnalyses}
            disabled={Object.values(loading).some(Boolean)}
          >
            运行所有分析
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
      </Paper>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {agentTypes.map((type) => (
          <Grid item xs={12} md={4} key={type}>
            <InvestmentAgentCard
              type={type}
              result={results[type]}
              loading={loading[type] || false}
              highlighted={selectedAgent === type}
              onClick={() => handleAgentClick(type)}
              stockData={stockData}
              openAIKey={openAIKey}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StockAnalysis; 