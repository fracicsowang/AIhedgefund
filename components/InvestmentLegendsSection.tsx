'use client';

import React from 'react';
import Image from 'next/image';

// Investment legends data
const investmentLegends = [
  {
    name: 'Warren Buffett',
    quote: 'Price is what you pay. Value is what you get.',
    imageKey: 'Buffett',
    description: 'The most famous value investor, known for buying quality companies with durable competitive advantages and holding them for the long term.'
  },
  {
    name: 'Benjamin Graham',
    quote: "The investor's chief problem–and even his worst enemy–is likely to be himself.",
    imageKey: 'graham',
    description: 'Father of value investing, focused on margin of safety, undervalued stocks, and strong financials.'
  },
  {
    name: 'Peter Lynch',
    quote: 'Know what you own and know why you own it.',
    imageKey: 'lynch',
    description: 'Legendary fund manager, advocates "invest in what you know" and looks for growth at a reasonable price.'
  },
  {
    name: 'Charlie Munger',
    quote: 'The big money is not in the buying and selling... but in waiting.',
    imageKey: 'munger',
    description: "Buffett's partner, master of multidisciplinary thinking, values patience, quality, and rationality."
  },
  {
    name: 'Bill Ackman',
    quote: 'If you want to have a better performance than the crowd, you must do things differently from the crowd.',
    imageKey: 'Ackman',
    description: 'Activist investor, seeks high-quality businesses and drives value through strategic change.'
  },
  {
    name: 'Michael Burry',
    quote: 'It is in the anomalies that new ideas and fortunes are made.',
    imageKey: 'Burry',
    description: 'Contrarian deep value investor, famous for predicting the subprime mortgage crisis.'
  },
  {
    name: 'Phil Fisher',
    quote: 'The stock market is filled with individuals who know the price of everything, but the value of nothing.',
    imageKey: 'Fisher',
    description: 'Pioneer of growth investing, emphasizes management quality, innovation, and long-term prospects.'
  },
  {
    name: 'Stanley Druckenmiller',
    quote: 'The best investors have no loyalty or love for an investment. The only thing they are wedded to is the right side of the market.',
    imageKey: 'druckenmiller',
    description: 'Legendary macro trader, known for bold, flexible bets and focus on asymmetric risk-reward.'
  },
  {
    name: 'Cathie Wood',
    quote: 'Innovation is key to growth, and disruptive innovation is key to extraordinary growth.',
    imageKey: 'wood',
    description: 'Founder of ARK Invest, focuses on disruptive innovation and high-growth technology companies.'
  }
];

export default function InvestmentLegendsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-10 text-center text-gray-800">Wisdom from the Legends</h2>
        {/* 第一行4个大师 */}
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          {investmentLegends.slice(0, 4).map((legend, index) => (
            <div key={index} className="flex flex-col items-center w-64 bg-white rounded-lg shadow-md p-6">
              <div className="w-32 h-32 mb-4 relative">
                <img 
                  src={`/images/legends/${legend.imageKey}.png`} 
                  alt={legend.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-gray-800 text-center px-2">
                <p className="text-base mb-2 italic">"{legend.quote}"</p>
                <p className="font-bold mb-1">{legend.name}</p>
                <p className="text-sm text-gray-600">{legend.description}</p>
              </div>
            </div>
          ))}
        </div>
        {/* 第二行5个大师 */}
        <div className="flex flex-wrap justify-center gap-8">
          {investmentLegends.slice(4).map((legend, index) => (
            <div key={index} className="flex flex-col items-center w-64 bg-white rounded-lg shadow-md p-6">
              <div className="w-32 h-32 mb-4 relative">
                <img 
                  src={`/images/legends/${legend.imageKey}.png`} 
                  alt={legend.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-gray-800 text-center px-2">
                <p className="text-base mb-2 italic">"{legend.quote}"</p>
                <p className="font-bold mb-1">{legend.name}</p>
                <p className="text-sm text-gray-600">{legend.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 