import Stripe from 'stripe';
import { supabase } from './supabase';

// 初始化Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('缺少STRIPE_SECRET_KEY环境变量');
}

// 使用最新可用的API版本
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' as any, // 类型断言，保证编译通过
});

/**
 * 创建Stripe客户
 * @param email 用户邮箱
 * @param userId Supabase用户ID
 */
export async function createStripeCustomer(email: string, userId: string) {
  // 创建Stripe客户
  const customer = await stripe.customers.create({
    email,
    metadata: {
      supabaseUserId: userId,
    },
  });
  
  // 在Supabase中保存Stripe客户ID
  await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      stripe_customer_id: customer.id,
      subscription_status: 'free',
    });
  
  return customer;
}

/**
 * 获取Stripe客户
 * @param userId Supabase用户ID
 */
export async function getStripeCustomer(userId: string) {
  // 从Supabase获取Stripe客户ID
  const { data, error } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();
  
  if (error || !data?.stripe_customer_id) {
    return null;
  }
  
  // 获取Stripe客户信息
  return await stripe.customers.retrieve(data.stripe_customer_id);
}

/**
 * 创建Stripe结账会话
 * @param customerId Stripe客户ID
 * @param priceId Stripe价格ID
 */
export async function createCheckoutSession(customerId: string, priceId: string) {
  // 价格配置，实际项目中可以从环境变量或数据库获取
  const prices = {
    basic: process.env.STRIPE_BASIC_PRICE_ID,
    premium: process.env.STRIPE_PREMIUM_PRICE_ID,
  };
  
  // 创建Stripe结账会话
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?canceled=true`,
    metadata: {
      productType: priceId === prices.basic ? 'basic' : 'premium',
    },
  });
  
  return session;
}

/**
 * 处理Stripe Webhook事件
 * @param event Stripe事件
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      // 用户完成结账，更新订阅状态
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.updated':
      // 订阅状态更新
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      // 订阅被取消
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    default:
      console.log(`未处理的事件类型: ${event.type}`);
  }
}

/**
 * 处理结账完成事件
 * @param session Stripe结账会话
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // 获取订阅信息
  if (!session.subscription) return;
  
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const customerId = session.customer as string;
  
  // 从客户元数据中获取Supabase用户ID
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  const userId = customer.metadata?.supabaseUserId;
  
  if (!userId) {
    console.error('无法找到用户ID:', customerId);
    return;
  }
  
  // 更新Supabase中的订阅状态
  await supabase
    .from('subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status === 'active' ? 
        (session.metadata?.productType || 'basic') : 'free',
      price_id: subscription.items.data[0].price.id,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
}

/**
 * 处理订阅更新事件
 * @param subscription Stripe订阅
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // 获取客户信息
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  const userId = customer.metadata?.supabaseUserId;
  
  if (!userId) {
    console.error('无法找到用户ID:', subscription.customer);
    return;
  }
  
  // 获取订阅类型
  const priceId = subscription.items.data[0].price.id;
  const { data } = await supabase
    .from('subscriptions')
    .select('subscription_status')
    .eq('price_id', priceId)
    .single();
  
  const subscriptionType = data?.subscription_status || 'basic';
  
  // 更新Supabase中的订阅状态
  await supabase
    .from('subscriptions')
    .update({
      subscription_status: subscription.status === 'active' ? subscriptionType : 'free',
      updated_at: new Date().toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('user_id', userId);
}

/**
 * 处理订阅删除事件
 * @param subscription Stripe订阅
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // 获取客户信息
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  const userId = customer.metadata?.supabaseUserId;
  
  if (!userId) {
    console.error('无法找到用户ID:', subscription.customer);
    return;
  }
  
  // 更新Supabase中的订阅状态
  await supabase
    .from('subscriptions')
    .update({
      subscription_status: 'free',
      stripe_subscription_id: null,
      price_id: null,
      updated_at: new Date().toISOString(),
      cancel_at_period_end: false,
    })
    .eq('user_id', userId);
} 