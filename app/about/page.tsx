import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={null} />
      
      <main className="flex-grow">
        <section className="bg-white py-12">
          <div className="container mx-auto px-4 flex flex-col items-center">
            <img src="/creater.png" alt="Francisco Wang" className="w-40 h-40 rounded-full object-cover shadow-lg mb-6 border-4 border-white" />
          </div>
        </section>
        <section className="bg-blue-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">About Legends AI</h1>
              <p className="text-xl mb-8">Hi, I'm Francisco Wang — the creator of Legends AI.</p>
              <p className="text-lg mb-6">
                A few years ago, I started my career as a railway signaling engineer. Since then, I've worn many hats: project manager, Latin America regional business director, CEO of a U.S. subsidiary, and later an Executive Director in a leading private equity fund, focusing on advanced manufacturing, renewable energy, and the digital economy. Today, I work as a research fellow at a university in the United States.
              </p>
              <p className="text-lg mb-6">
                Outside of my professional journey, I've always been passionate about exploring artificial intelligence and the stock market. This app was inspired by an open-source project by Virat Singh on GitHub, and I wanted to build on that idea to create a smarter, more user-friendly investment analysis tool.
              </p>
              <p className="text-lg mb-6">
                Legends AI is my attempt to blend the wisdom of legendary investors with the power of AI — to help everyday investors navigate the markets with confidence.
              </p>
              <p className="text-lg mb-6">
                This project is non-profit and open to all. Thank you for using this app. I hope it brings you insights, confidence, and a little bit of luck in your investment journey!
              </p>
            </div>
          </div>
        </section>
        
        {/* Investment Masters */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Investment Masters We Model</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Buffett */}
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
                <img src="/images/legends/Buffett.png" alt="Warren Buffett" className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-100" />
                <h3 className="text-xl font-bold mb-2">Warren Buffett</h3>
                <p className="italic text-blue-900 mb-2 text-center">“Price is what you pay. Value is what you get.”</p>
                <p className="text-gray-700 text-center">Icon of value investing, focuses on quality companies with enduring competitive advantages and long-term holding.</p>
              </div>
              {/* Graham */}
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
                <img src="/images/legends/graham.png" alt="Benjamin Graham" className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-100" />
                <h3 className="text-xl font-bold mb-2">Benjamin Graham</h3>
                <p className="italic text-blue-900 mb-2 text-center">“The essence of investment management is the management of risks, not the management of returns.”</p>
                <p className="text-gray-700 text-center">Father of value investing, emphasizes margin of safety and intrinsic value.</p>
              </div>
              {/* Peter Lynch */}
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
                <img src="/images/legends/lynch.png" alt="Peter Lynch" className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-100" />
                <h3 className="text-xl font-bold mb-2">Peter Lynch</h3>
                <p className="italic text-blue-900 mb-2 text-center">“Know what you own, and know why you own it.”</p>
                <p className="text-gray-700 text-center">Growth investing expert, prefers companies with sustainable growth and deep industry understanding.</p>
              </div>
              {/* Charlie Munger */}
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
                <img src="/images/legends/munger.png" alt="Charlie Munger" className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-100" />
                <h3 className="text-xl font-bold mb-2">Charlie Munger</h3>
                <p className="italic text-blue-900 mb-2 text-center">“The big money is not in the buying and selling, but in the waiting.”</p>
                <p className="text-gray-700 text-center">Advocate of multidisciplinary thinking, emphasizes quality and economic moats.</p>
              </div>
              {/* Bill Ackman */}
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
                <img src="/images/legends/Ackman.png" alt="Bill Ackman" className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-100" />
                <h3 className="text-xl font-bold mb-2">Bill Ackman</h3>
                <p className="italic text-blue-900 mb-2 text-center">“If you want to have a better performance than the crowd, you must do things differently from the crowd.”</p>
                <p className="text-gray-700 text-center">Activist investor, focuses on high-quality businesses and value creation through change.</p>
              </div>
              {/* Michael Burry */}
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
                <img src="/images/legends/Burry.png" alt="Michael Burry" className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-100" />
                <h3 className="text-xl font-bold mb-2">Michael Burry</h3>
                <p className="italic text-blue-900 mb-2 text-center">“It is in the anomalies that new ideas and fortunes are made.”</p>
                <p className="text-gray-700 text-center">Famous for predicting the subprime crisis, focuses on deep value and contrarian investing.</p>
              </div>
              {/* Phil Fisher */}
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
                <img src="/images/legends/Fisher.png" alt="Phil Fisher" className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-100" />
                <h3 className="text-xl font-bold mb-2">Phil Fisher</h3>
                <p className="italic text-blue-900 mb-2 text-center">“The stock market is filled with individuals who know the price of everything, but the value of nothing.”</p>
                <p className="text-gray-700 text-center">Pioneer of growth investing, emphasizes management quality and long-term innovation.</p>
              </div>
              {/* Stanley Druckenmiller */}
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
                <img src="/images/legends/druckenmiller.png" alt="Stanley Druckenmiller" className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-100" />
                <h3 className="text-xl font-bold mb-2">Stanley Druckenmiller</h3>
                <p className="italic text-blue-900 mb-2 text-center">“The best investors have no loyalty or love for an investment. The only thing they are wedded to is the right side of the market.”</p>
                <p className="text-gray-700 text-center">Legendary macro trader, known for flexibility and bold bets on global trends.</p>
              </div>
              {/* Cathie Wood */}
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
                <img src="/images/legends/wood.png" alt="Cathie Wood" className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-100" />
                <h3 className="text-xl font-bold mb-2">Cathie Wood</h3>
                <p className="italic text-blue-900 mb-2 text-center">“Innovation is key to growth, and disruptive innovation is key to extraordinary growth.”</p>
                <p className="text-gray-700 text-center">Focuses on disruptive innovation and high-growth technology companies.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Contact Us */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Contact Me</h2>
              <p className="text-lg text-gray-700 mb-8">
                Have any questions or suggestions? We'd love to hear from you!
              </p>
              
              <div className="flex flex-col md:flex-row justify-center gap-6 mb-8">
                <div className="flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-900 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span>francisco.wang@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

export const metadata = {
  title: 'About | Legends AI - Legendary Investors & AI Agents',
  description: 'Learn about Legends AI, a non-profit platform blending legendary investor wisdom and AI agents for smarter investment and hedge fund strategies. Created by Francisco Wang.',
  keywords: 'about, AI agent, legendary investors, hedge fund, investment, Francisco Wang, open source, smart investing',
}; 