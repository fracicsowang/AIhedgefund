# StockData类型错误修复指南

## 问题描述

在`app/api/stocks/opinion/route.ts`文件中，出现了几个类型错误，主要是因为`StockData`类型定义与实际使用的属性不匹配。具体错误涉及以下属性:

- `quoteSummary.fiftyTwoWeekHigh`
- `quoteSummary.fiftyTwoWeekLow`
- `quoteSummary.marketCap`
- `quoteSummary.trailingPE`
- `quoteSummary.epsTrailingTwelveMonths`
- `quoteSummary.bookValue`
- `quoteSummary.dividendYield`

## 解决方案

需要扩展`@/types`中的`StockData`类型定义，以包含这些实际使用的字段。

### 修改步骤

1. 找到`types/index.ts`或相关类型定义文件
2. 扩展`StockData`类型定义，添加缺失的属性

### 类型修复示例

```typescript
// 更新StockData类型定义
export interface StockData {
  symbol: string;
  price?: {
    regularMarketPrice?: number;
    regularMarketChange?: number;
    regularMarketChangePercent?: number;
    regularMarketDayHigh?: number;
    regularMarketDayLow?: number;
    regularMarketVolume?: number;
  };
  quoteSummary?: {
    longName?: string;
    // 添加缺失的属性
    fiftyTwoWeekHigh?: number;
    fiftyTwoWeekLow?: number;
    marketCap?: number;
    trailingPE?: number;
    epsTrailingTwelveMonths?: number;
    bookValue?: number;
    dividendYield?: number;
    
    // 保留已有的嵌套属性
    defaultKeyStatistics?: {
      forwardPE?: { raw?: number; fmt?: string };
      priceToBook?: { raw?: number; fmt?: string };
      returnOnEquity?: { raw?: number; fmt?: string };
      debtToEquity?: { raw?: number; fmt?: string };
      profitMargins?: { raw?: number; fmt?: string };
    };
    financialData?: {
      totalCash?: { raw?: number; fmt?: string };
      totalDebt?: { raw?: number; fmt?: string };
      operatingCashflow?: { raw?: number; fmt?: string };
      revenueGrowth?: { raw?: number; fmt?: string };
      earningsGrowth?: { raw?: number; fmt?: string };
    };
    recommendationTrend?: {
      trend?: any[];
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
```

### 替代方案

如果不想修改核心类型定义，也可以在`stocks/opinion/route.ts`文件中使用类型断言或扩展接口:

```typescript
// 在route.ts文件中定义扩展接口
interface ExtendedQuoteSummary {
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  marketCap?: number;
  trailingPE?: number;
  epsTrailingTwelveMonths?: number;
  bookValue?: number;
  dividendYield?: number;
  // ...其他原有属性
}

// 在生成提示函数中使用类型断言
function generatePrompt(stockData: StockData): string {
  const { symbol, price } = stockData;
  const quoteSummary = stockData.quoteSummary as unknown as ExtendedQuoteSummary;
  
  // 继续使用扩展后的类型
  return `
    // ... 原有模板字符串
  `;
}
```

## 数据适配

长期解决方案是在`fetchStockData.ts`中确保返回的数据结构与类型定义一致。可能需要对Yahoo Finance API返回的数据进行适当转换，确保它符合我们的类型定义。

### 数据适配示例

```typescript
// 在fetchStockData.ts中添加数据适配逻辑
export async function fetchStockData(symbol: string): Promise<StockData> {
  try {
    // 获取股票数据...
    
    // 适配数据结构
    const adaptedQuoteSummary = {
      longName: quoteSummaryResponse.price?.longName,
      fiftyTwoWeekHigh: quoteSummaryResponse.summaryDetail?.fiftyTwoWeekHigh?.raw,
      fiftyTwoWeekLow: quoteSummaryResponse.summaryDetail?.fiftyTwoWeekLow?.raw,
      marketCap: quoteSummaryResponse.summaryDetail?.marketCap?.raw,
      trailingPE: quoteSummaryResponse.summaryDetail?.trailingPE?.raw,
      epsTrailingTwelveMonths: quoteSummaryResponse.defaultKeyStatistics?.trailingEPS?.raw,
      bookValue: quoteSummaryResponse.defaultKeyStatistics?.bookValue?.raw,
      dividendYield: quoteSummaryResponse.summaryDetail?.dividendYield?.raw,
      // 其他原有字段...
    };
    
    // 返回适配后的数据
    return {
      symbol,
      price: { /* ... */ },
      quoteSummary: adaptedQuoteSummary,
      // 其他字段...
    };
  } catch (error) {
    console.error(`获取股票数据失败: ${symbol}`, error);
    throw new Error(`获取股票数据失败: ${symbol}`);
  }
}
``` 