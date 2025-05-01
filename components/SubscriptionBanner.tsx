import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SubscriptionStatus } from '@/types';

interface SubscriptionBannerProps {
  subscriptionStatus: SubscriptionStatus;
}

export default function SubscriptionBanner({ subscriptionStatus }: SubscriptionBannerProps) {
  if (subscriptionStatus === 'premium') {
    return null; // 高级订阅用户不显示横幅
  }
  
  return (
    <div className="w-full p-4 mb-6 bg-gradient-to-r from-blue-950 to-blue-800 text-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-bold mb-2">
            {subscriptionStatus === 'basic' 
              ? '升级至高级订阅，解锁更多投资洞见' 
              : '开始您的AI投资之旅'}
          </h3>
          <p className="text-blue-200">
            {subscriptionStatus === 'basic'
              ? '专业版提供更广泛的股票池、高级技术分析和更多投资大师智能建议。'
              : '订阅我们的服务，获取来自顶级投资大师的AI智能交易建议。'}
          </p>
        </div>
        <div className="flex space-x-2">
          {subscriptionStatus === 'free' && (
            <>
              <Link href="/pricing">
                <Button variant="outline" className="bg-transparent text-white border-white hover:bg-blue-900">
                  查看价格
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-white text-blue-900 hover:bg-blue-100">
                  立即订阅
                </Button>
              </Link>
            </>
          )}
          
          {subscriptionStatus === 'basic' && (
            <Link href="/dashboard">
              <Button className="bg-white text-blue-900 hover:bg-blue-100">
                升级订阅
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 