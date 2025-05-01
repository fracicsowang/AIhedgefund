'use client';

import React from 'react';
import Image from 'next/image';

export default function SystemWorksSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-6 text-center text-gray-800">How the AI Hedge Fund System Works</h2>
        
        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-lg text-center text-gray-600 italic">
            Ever wonder what would happen if you could have the world's top investors in one room, debating every trade for you?
            <br />
            Well — now you can.
          </p>
        </div>
        
        {/* Principle diagram - using blue gradient background blended with image */}
        <div className="flex justify-center mb-12 bg-gradient-to-b from-blue-50 to-white py-8 rounded-xl">
          <div className="relative w-full max-w-3xl h-[460px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-blue-50 opacity-75 z-0"></div>
            <Image 
              src="/images/principle.png" 
              alt="AI Hedge Fund System Principle" 
              fill
              className="object-contain z-10 relative"
              priority
            />
          </div>
        </div>
        
        {/* Work process explanation */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Here's how it works:</h3>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
              <div>
                <h4 className="text-xl font-bold text-gray-800">Pick Your Dream Team of Legends</h4>
                <p className="text-gray-600">Choose from icons like Ben Graham, Cathie Wood, Warren Buffett, and more. Each "Agent" brings their unique investing philosophy to the table.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
              <div>
                <h4 className="text-xl font-bold text-gray-800">Each Agent Analyzes the Market</h4>
                <p className="text-gray-600">Every Agent runs their analysis — value, growth, momentum, macro — and generates their own buy/sell signals.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
              <div>
                <h4 className="text-xl font-bold text-gray-800">Risk Manager Keeps You Safe</h4>
                <p className="text-gray-600">Before acting, the Risk Manager evaluates overall portfolio risk, like a built-in brake system to avoid reckless bets.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
              <div>
                <h4 className="text-xl font-bold text-gray-800">Portfolio Manager Calls the Shots</h4>
                <p className="text-gray-600">It's decision time. The Portfolio Manager takes input from all Agents + risk insights and decides whether to Buy, Sell, Short, Cover, or Hold.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">5</div>
              <div>
                <h4 className="text-xl font-bold text-gray-800">Action!</h4>
                <p className="text-gray-600">The system executes the optimal trading decision — so you can stay ahead while staying hands-free.</p>
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="my-10 border-t border-gray-200"></div>
          
          {/* Metaphor explanation */}
          <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50 p-8 rounded-xl shadow-sm border border-blue-100">
            <p className="text-lg font-medium text-gray-700">
              <span className="text-2xl text-blue-600 font-serif mr-2">📝</span> 
              <span className="italic">Think of it like this:</span>
            </p>
            <p className="text-xl mt-3 text-gray-800 leading-relaxed italic">
              "It's like commanding an investment starship traversing the cosmos of markets: the Agents are your elite crew of navigational experts, the Risk Manager is your advanced shield system protecting you from financial meteors, and the Portfolio Manager is your seasoned captain, synthesizing all insights to plot the most profitable course through the ever-shifting universe of investment opportunities."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 