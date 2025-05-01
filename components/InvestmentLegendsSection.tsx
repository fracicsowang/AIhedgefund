'use client';

import React from 'react';
import Image from 'next/image';

// Investment legends data
const investmentLegends = [
  {
    name: 'Benjamin Graham',
    quote: "The investor's chief problem–and even his worst enemy–is likely to be himself.",
    imageKey: 'graham',
  },
  {
    name: 'Charlie Munger',
    quote: "The big money is not in the buying and selling... but in waiting.",
    imageKey: 'munger',
  },
  {
    name: 'Cathie Wood',
    quote: "Innovation solves problems and transforms lives.",
    imageKey: 'wood',
  },
  {
    name: 'Peter Lynch',
    quote: "Be fearful when others are greedy, and greedy when others are fearful.",
    imageKey: 'lynch',
  },
  {
    name: 'Stanley Druckenmiller',
    quote: "Know what you own and know why you own it.",
    imageKey: 'druckenmiller',
  }
];

export default function InvestmentLegendsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-10 text-center text-gray-800">Wisdom from the Legends</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {investmentLegends.map((legend, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Legend silhouette */}
              <div className="w-40 h-40 mb-6 relative">
                <img 
                  src={`/images/legends/${legend.imageKey}.png`} 
                  alt={legend.name}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Quote content */}
              <div className="text-gray-800 text-center px-2">
                <p className="text-sm md:text-base mb-4 italic">"{legend.quote}"</p>
                <p className="font-bold">{legend.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 