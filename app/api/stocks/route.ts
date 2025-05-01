import { NextResponse } from 'next/server';
import { fetchFamousStocks, fetchMoreStocks } from '@/lib/fetchStockData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'famous';
    
    // 根据请求参数获取不同的股票数据
    let stocks;
    if (type === 'more') {
      stocks = await fetchMoreStocks();
    } else {
      stocks = await fetchFamousStocks();
    }
    
    return NextResponse.json(stocks);
  } catch (error) {
    console.error('获取股票数据失败', error);
    return NextResponse.json(
      { error: '获取股票数据失败' },
      { status: 500 }
    );
  }
} 