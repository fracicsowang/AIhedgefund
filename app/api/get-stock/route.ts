import { NextRequest, NextResponse } from 'next/server';
import { fetchStockData } from '@/lib/fetchStockData';
import { getCurrentUser, getUserSubscription } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // 获取symbol参数
    const symbol = request.nextUrl.searchParams.get('symbol');
    
    if (!symbol) {
      return NextResponse.json(
        { error: '缺少symbol参数' },
        { status: 400 }
      );
    }
    
    // 获取当前用户（如果已登录）
    const user = await getCurrentUser();
    
    // 检查是否为付费用户（仅特定热门股票对免费用户开放）
    if (user) {
      const subscription = await getUserSubscription(user.id);
      
      // 定义免费用户可访问的股票列表
      const freeStocks = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'META', 'NVDA', 'TSLA'];
      
      // 如果用户是免费用户且尝试访问付费股票，返回错误
      if (
        subscription.subscription_status === 'free' && 
        !freeStocks.includes(symbol.toUpperCase())
      ) {
        return NextResponse.json(
          { error: '需要订阅才能查看此股票的数据' },
          { status: 403 }
        );
      }
    }
    
    // 获取股票数据
    const stockData = await fetchStockData(symbol);
    
    return NextResponse.json(stockData);
  } catch (error) {
    console.error('获取股票数据失败:', error);
    return NextResponse.json(
      { error: '获取股票数据失败' },
      { status: 500 }
    );
  }
} 