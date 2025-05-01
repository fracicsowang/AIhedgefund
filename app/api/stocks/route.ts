import { NextResponse } from 'next/server';
import { fetchFamousStocks, fetchMoreStocks } from '@/lib/fetchStockData';
import { StockData } from '@/types';

// 简单的内存缓存，避免频繁请求Yahoo Finance API
let stocksCache: {
  famous: StockData[];
  more: StockData[];
  timestamp: number;
  lastError?: {
    message: string;
    time: number;
  };
  // 速率限制追踪
  rateLimit: {
    count: number;
    resetTime: number;
  };
} = {
  famous: [],
  more: [],
  timestamp: 0,
  // 初始化速率限制追踪器
  rateLimit: {
    count: 0,
    resetTime: Date.now() + 60 * 60 * 1000 // 1小时后重置
  }
};

// 缓存有效期 (毫秒)
const CACHE_TTL = 30 * 60 * 1000; // 30分钟
// 错误后重试延迟
const ERROR_RETRY_DELAY = 30 * 1000; // 30秒
// 速率限制 - 每小时最大请求次数
const HOURLY_RATE_LIMIT = 300; // Yahoo Finance API限制约为每小时300-500次请求

// 检查是否达到速率限制
function checkRateLimit(): boolean {
  const now = Date.now();
  
  // 如果已经过了重置时间，重置计数器
  if (now > stocksCache.rateLimit.resetTime) {
    stocksCache.rateLimit = {
      count: 0,
      resetTime: now + 60 * 60 * 1000 // 1小时后重置
    };
  }
  
  // 检查是否达到限制
  return stocksCache.rateLimit.count >= HOURLY_RATE_LIMIT;
}

// 更新速率限制计数器
function updateRateLimit() {
  stocksCache.rateLimit.count++;
}

// 添加随机延迟，分散请求
async function addRandomDelay() {
  const delay = Math.floor(Math.random() * 500) + 200; // 200-700ms随机延迟
  await new Promise(resolve => setTimeout(resolve, delay));
}

export async function GET(request: Request) {
  await addRandomDelay(); // 添加随机延迟分散请求
  
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'famous';
    
    // 检查缓存是否有效
    const now = Date.now();
    const cacheExpired = now - stocksCache.timestamp > CACHE_TTL;
    
    // 检查是否处于错误冷却期
    const inErrorCooldown = stocksCache.lastError && 
                           (now - stocksCache.lastError.time < ERROR_RETRY_DELAY);
    
    // 检查速率限制
    const rateLimited = checkRateLimit();
    
    // 如果缓存有效且有数据，直接返回缓存
    if (!cacheExpired && 
        ((type === 'famous' && stocksCache.famous.length > 0) || 
         (type === 'more' && stocksCache.more.length > 0))) {
      console.log(`返回缓存的${type === 'famous' ? '热门' : '更多'}股票数据 (${type === 'famous' ? stocksCache.famous.length : stocksCache.more.length}支)`);
      return NextResponse.json(type === 'famous' ? stocksCache.famous : stocksCache.more);
    }
    
    // 如果在错误冷却期或达到速率限制，且有缓存数据，返回缓存
    if ((inErrorCooldown || rateLimited) && 
        ((type === 'famous' && stocksCache.famous.length > 0) || 
         (type === 'more' && stocksCache.more.length > 0))) {
      const reason = inErrorCooldown ? '错误冷却期' : '达到速率限制';
      console.log(`${reason}内，返回缓存的${type === 'famous' ? '热门' : '更多'}股票数据`);
      return NextResponse.json(type === 'famous' ? stocksCache.famous : stocksCache.more);
    }
    
    // 如果达到速率限制且没有缓存，返回错误
    if (rateLimited && 
        ((type === 'famous' && stocksCache.famous.length === 0) || 
         (type === 'more' && stocksCache.more.length === 0))) {
      console.log('达到API速率限制，且无可用缓存');
      return NextResponse.json(
        { error: '系统繁忙，请稍后再试 (API速率限制)' },
        { status: 429 }
      );
    }
    
    // 如果缓存失效或无数据，从Yahoo Finance获取数据
    console.log(`正在获取${type === 'famous' ? '热门' : '更多'}股票数据...`);
    
    // 更新速率限制计数器
    updateRateLimit();
    
    // 根据请求参数获取不同的股票数据
    let stocks: StockData[] = [];
    
    if (type === 'more') {
      stocks = await fetchMoreStocks();
      if (stocks.length > 0) {
        stocksCache.more = stocks;
        stocksCache.timestamp = now;
        // 清除错误状态
        delete stocksCache.lastError;
      }
    } else {
      stocks = await fetchFamousStocks();
      if (stocks.length > 0) {
        stocksCache.famous = stocks;
        stocksCache.timestamp = now;
        // 清除错误状态
        delete stocksCache.lastError;
      }
    }
    
    // 检查是否成功获取数据
    if (!stocks || stocks.length === 0) {
      console.error('从Yahoo Finance获取数据失败');
      
      // 设置错误状态
      stocksCache.lastError = {
        message: '获取股票数据失败',
        time: now
      };
      
      // 如果有旧缓存，返回旧缓存
      if ((type === 'famous' && stocksCache.famous.length > 0) || 
          (type === 'more' && stocksCache.more.length > 0)) {
        console.log(`获取失败，返回旧缓存的${type === 'famous' ? '热门' : '更多'}股票数据`);
        return NextResponse.json(type === 'famous' ? stocksCache.famous : stocksCache.more);
      }
      
      return NextResponse.json(
        { error: '获取股票数据失败，请稍后重试' },
        { status: 500 }
      );
    }
    
    console.log(`成功获取${stocks.length}支${type === 'famous' ? '热门' : '更多'}股票数据`);
    return NextResponse.json(stocks);
  } catch (error) {
    console.error('获取股票数据失败', error);
    
    const now = Date.now();
    // 记录错误
    stocksCache.lastError = {
      message: error instanceof Error ? error.message : '未知错误',
      time: now
    };
    
    // 如果有缓存，返回缓存数据
    const type = new URL(request.url).searchParams.get('type') || 'famous';
    if ((type === 'famous' && stocksCache.famous.length > 0) || 
        (type === 'more' && stocksCache.more.length > 0)) {
      console.log(`发生异常，返回缓存的${type === 'famous' ? '热门' : '更多'}股票数据`);
      return NextResponse.json(type === 'famous' ? stocksCache.famous : stocksCache.more);
    }
    
    return NextResponse.json(
      { error: '获取股票数据失败，服务器处理异常' },
      { status: 500 }
    );
  }
} 