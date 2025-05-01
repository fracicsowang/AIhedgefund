import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase';
import { createStripeCustomer, getStripeCustomer, createCheckoutSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // 验证用户是否登录
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      );
    }
    
    // 解析请求体获取订阅级别
    const { plan } = await request.json();
    
    if (!plan || !['basic', 'premium'].includes(plan)) {
      return NextResponse.json(
        { error: '无效的订阅计划' },
        { status: 400 }
      );
    }
    
    // 获取或创建Stripe客户
    let customer = await getStripeCustomer(user.id);
    if (!customer) {
      customer = await createStripeCustomer(user.email as string, user.id);
    }
    
    // 获取对应的价格ID
    const priceId = plan === 'basic' 
      ? process.env.STRIPE_BASIC_PRICE_ID 
      : process.env.STRIPE_PREMIUM_PRICE_ID;
    
    if (!priceId) {
      return NextResponse.json(
        { error: '订阅价格配置错误' },
        { status: 500 }
      );
    }
    
    // 创建结账会话
    const session = await createCheckoutSession(customer.id, priceId);
    
    // 返回结账URL
    return NextResponse.json({
      checkoutUrl: session.url
    });
  } catch (error) {
    console.error('创建订阅失败:', error);
    return NextResponse.json(
      { error: '创建订阅失败' },
      { status: 500 }
    );
  }
}

// 处理Stripe Webhook回调的API端点
export async function PUT(request: NextRequest) {
  try {
    const sig = request.headers.get('stripe-signature');
    
    if (!sig) {
      return NextResponse.json(
        { error: '缺少Stripe签名' },
        { status: 400 }
      );
    }
    
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook密钥未配置' },
        { status: 500 }
      );
    }
    
    // 获取请求体
    const body = await request.text();
    
    // 导入Stripe处理函数
    const { stripe, handleStripeWebhook } = await import('@/lib/stripe');
    
    // 构造Stripe事件
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    
    // 处理Webhook事件
    await handleStripeWebhook(event);
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook错误:', error.message);
    return NextResponse.json(
      { error: `Webhook错误: ${error.message}` },
      { status: 400 }
    );
  }
} 