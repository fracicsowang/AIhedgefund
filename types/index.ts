// 股票数据类型定义
export interface StockData {
  symbol: string;
  price: {
    regularMarketPrice?: number;
    regularMarketChange?: number;
    regularMarketChangePercent?: number;
    regularMarketDayHigh?: number;
    regularMarketDayLow?: number;
    regularMarketVolume?: number;
  };
  // Ben Graham agent required top-level fields
  earningsPerShare?: number;
  bookValuePerShare?: number;
  sharesOutstanding?: number;
  currentRatio?: number;
  debtToEquity?: number;
  marketCap?: number;
  quoteSummary?: {
    longName?: string;
    defaultKeyStatistics?: {
      forwardPE?: {
        raw?: number;
        fmt?: string;
      };
      priceToBook?: {
        raw?: number;
        fmt?: string;
      };
      returnOnEquity?: {
        raw?: number;
        fmt?: string;
      };
      debtToEquity?: {
        raw?: number;
        fmt?: string;
      };
      profitMargins?: {
        raw?: number;
        fmt?: string;
      };
    };
    financialData?: {
      totalCash?: {
        raw?: number;
        fmt?: string;
      };
      totalDebt?: {
        raw?: number;
        fmt?: string;
      };
      operatingCashflow?: {
        raw?: number;
        fmt?: string;
      };
      revenueGrowth?: {
        raw?: number;
        fmt?: string;
      };
      earningsGrowth?: {
        raw?: number;
        fmt?: string;
      };
    };
    recommendationTrend?: {
      trend?: {
        buy?: number;
        hold?: number;
        sell?: number;
        strongBuy?: number;
        strongSell?: number;
      }[];
    };
  };
  technicalIndicators?: {
    rsi?: number;
    macd?: {
      macdLine?: number;
      signalLine?: number;
      histogram?: number;
    };
    movingAverages?: {
      ma50?: number;
      ma200?: number;
    };
  };
  sentiment?: {
    bearishPercent?: number;
    bullishPercent?: number;
    newsScore?: number;
  };
}

// 用户类型定义
export interface User {
  id: string;
  email: string;
  subscription: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

// 订阅状态
export type SubscriptionStatus = 'free' | 'basic' | 'premium';

// 交易建议
export interface TradeRecommendation {
  symbol: string;
  agentName: string;
  decision: 'BUY' | 'SELL' | 'HOLD';
  reasoning: string;
  confidence: number;
  timestamp: string;
}

// 投资组合决策
export interface PortfolioDecision {
  symbol: string;
  finalDecision: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  agentDecisions: TradeRecommendation[];
  fundamentals: {
    valuation: string;
    growth: string;
    profitability: string;
    financialHealth: string;
  };
  sentiment: {
    analystRating: string;
    newsSentiment: string;
    institutionalHoldings: string;
  };
  technicals: {
    trend: string;
    momentum: string;
    volatility: string;
  };
} 