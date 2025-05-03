import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={null} />
      
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
            
            <div className="space-y-10">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">About Our Service</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">How does the AI Hedge Fund work?</h3>
                    <p className="text-gray-700">
                      Our AI Hedge Fund combines the investment philosophies of legendary investors like Warren Buffett, 
                      Benjamin Graham, and others. The system analyzes stocks using multiple strategies simultaneously, 
                      evaluates risks, and provides specific investment recommendations based on real-time market data.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-2">How accurate are the investment recommendations?</h3>
                    <p className="text-gray-700">
                      Our system provides investment recommendations based on established investment principles and real-time data. 
                      Each recommendation includes a confidence score that reflects the strength of the analysis. However, all 
                      investments carry risk, and past performance doesn't guarantee future results.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-2">Do I need investment experience to use this platform?</h3>
                    <p className="text-gray-700">
                      No prior investment experience is needed. Our platform is designed to be intuitive for beginners 
                      while providing valuable insights for experienced investors. We provide detailed analysis explanations 
                      and educational materials to help you understand each recommendation.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Subscription Plans</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">How do I choose the right plan?</h3>
                    <p className="text-gray-700">
                      If you're a beginner, you can start with the free plan to get familiar with our services. For users with 
                      some investment experience, we recommend the basic plan. For professional investors seeking comprehensive 
                      analysis, the premium plan offers the most complete service with access to all investment strategies and tools.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-2">Can I change or cancel my subscription anytime?</h3>
                    <p className="text-gray-700">
                      Yes, you can upgrade, downgrade, or cancel your subscription at any time in your account settings. 
                      After cancellation, your service will continue until the end of the current billing cycle.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-2">Is there a refund policy?</h3>
                    <p className="text-gray-700">
                      We offer a 14-day money-back guarantee. If you're not satisfied with the service within 14 days of 
                      subscribing, you can contact our customer service to request a full refund.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Technical Questions</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Are investment recommendations updated in real-time?</h3>
                    <p className="text-gray-700">
                      Yes, our AI system updates investment recommendations in real-time based on the latest market data, 
                      ensuring you receive analysis based on current market conditions.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-2">Why do I need an OpenAI API key for some features?</h3>
                    <p className="text-gray-700">
                      Some of our advanced analysis strategies utilize OpenAI's GPT technology to generate more detailed 
                      investment reasoning. An API key is required to access these features. Your key is only used for 
                      analysis during your session and is never stored on our servers.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-2">How do I get started with the platform?</h3>
                    <p className="text-gray-700">
                      Simply sign up for a free account, navigate to our stock analysis page, select a stock symbol, 
                      choose which investment strategies you want to apply, and start the analysis. The system will 
                      guide you through the entire process with clear instructions.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-8 rounded-lg border border-blue-200">
                <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
                <p className="text-gray-700 mb-4">
                  If you couldn't find the answer to your question, feel free to contact our customer support team.
                </p>
                <Link href="/contact">
                  <button className="bg-blue-900 text-white py-3 px-6 rounded-md hover:bg-blue-800 transition-colors">
                    Contact Support
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export const metadata = {
  title: 'FAQ | Legends AI - AI Agents & Hedge Fund Q&A',
  description: 'Frequently asked questions about Legends AI, AI investment agents, hedge fund strategies, and how to use the platform for smarter investing.',
  keywords: 'FAQ, questions, AI agent, hedge fund, investment, smart investing, platform help, legendary investors',
}; 