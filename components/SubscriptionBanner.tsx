import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SubscriptionStatus } from '@/types';

interface SubscriptionBannerProps {
  subscriptionStatus: SubscriptionStatus;
}

export default function SubscriptionBanner({ subscriptionStatus }: SubscriptionBannerProps) {
  if (subscriptionStatus === 'premium') {
    return null; // Premium subscribers don't see the banner
  }
  
  return (
    <div className="w-full p-4 mb-6 bg-gradient-to-r from-blue-950 to-blue-800 text-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-bold mb-2">
            {subscriptionStatus === 'basic' 
              ? 'Upgrade to Premium to Unlock More Investment Insights' 
              : 'Start Your AI Investment Journey'}
          </h3>
          <p className="text-blue-200">
            {subscriptionStatus === 'basic'
              ? 'Premium offers a wider stock selection, advanced technical analysis, and more intelligent recommendations from investment masters.'
              : 'Subscribe to our service to get AI-powered trading recommendations from top investment masters.'}
          </p>
        </div>
        <div className="flex space-x-2">
          {subscriptionStatus === 'free' && (
            <>
              <Link href="/pricing">
                <Button variant="outline" className="bg-transparent text-white border-white hover:bg-blue-900">
                  View Pricing
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-white text-blue-900 hover:bg-blue-100">
                  Subscribe Now
                </Button>
              </Link>
            </>
          )}
          
          {subscriptionStatus === 'basic' && (
            <Link href="/dashboard">
              <Button className="bg-white text-blue-900 hover:bg-blue-100">
                Upgrade Subscription
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 