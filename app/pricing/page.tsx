import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={null} />
      
      <main className="flex-grow">
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h1 className="text-4xl font-bold mb-4">Choose a Subscription Plan That's Right for You</h1>
              <p className="text-xl text-gray-600">
                Whether you're a beginner or an experienced investor, we have a plan that suits your needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Free Plan */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Free</h3>
                  <div className="text-4xl font-bold mb-4">¥0<span className="text-gray-500 text-base font-normal">/month</span></div>
                  <p className="text-gray-600 mb-6">Perfect for users who want to explore AI investment advisors</p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Access to 7 popular stocks</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Graham investment strategy</span>
                    </li>
                    <li className="flex items-center text-gray-400">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span>More investment legend strategies</span>
                    </li>
                    <li className="flex items-center text-gray-400">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span>Broader stock selection</span>
                    </li>
                    <li className="flex items-center text-gray-400">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span>Professional risk management tools</span>
                    </li>
                  </ul>
                  
                  <Link href="/signup">
                    <button className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-md hover:bg-gray-300 transition-colors">
                      Sign Up Free
                    </button>
                  </Link>
                </div>
              </div>
              
              {/* Basic Plan */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden transform scale-105 z-10 border-2 border-blue-500">
                <div className="bg-blue-500 text-white py-2 text-center font-bold">
                  Recommended
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Basic</h3>
                  <div className="text-4xl font-bold mb-4">¥59<span className="text-gray-500 text-base font-normal">/month</span></div>
                  <p className="text-gray-600 mb-6">Quality choice for individual investors</p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>All free plan features</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>5 investment legend strategies</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Access to 50+ stock analyses</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Basic risk management tools</span>
                    </li>
                    <li className="flex items-center text-gray-400">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span>Advanced technical analysis</span>
                    </li>
                  </ul>
                  
                  <Link href="/subscribe?plan=basic">
                    <button className="w-full bg-blue-900 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-800 transition-colors">
                      Choose This Plan
                    </button>
                  </Link>
                </div>
              </div>
              
              {/* Premium Plan */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Premium</h3>
                  <div className="text-4xl font-bold mb-4">¥99<span className="text-gray-500 text-base font-normal">/month</span></div>
                  <p className="text-gray-600 mb-6">Full-featured choice for professional investors</p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>All basic plan features</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>9 complete investment legend strategies</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Access to 100+ stock analyses</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Advanced risk management tools</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Professional technical analysis indicators</span>
                    </li>
                  </ul>
                  
                  <Link href="/subscribe?plan=premium">
                    <button className="w-full bg-gray-800 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-700 transition-colors">
                      Choose This Plan
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="max-w-3xl mx-auto space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-2">How do I choose the right plan?</h3>
                <p className="text-gray-600">
                  If you're a beginner, you can start with the free plan to get familiar with our services. For users with some investment experience, we recommend the basic plan. For professional investors seeking comprehensive analysis, the premium plan offers the most complete service.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2">Can I change or cancel my subscription anytime?</h3>
                <p className="text-gray-600">
                  Yes, you can upgrade, downgrade, or cancel your subscription at any time in your account settings. After cancellation, your service will continue until the end of the current billing cycle.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2">Is there a refund policy?</h3>
                <p className="text-gray-600">
                  We offer a 14-day money-back guarantee. If you're not satisfied with the service within 14 days of subscribing, you can contact our customer service to request a full refund.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2">Are investment recommendations updated in real-time?</h3>
                <p className="text-gray-600">
                  Yes, our AI system updates investment recommendations in real-time based on the latest market data, ensuring you receive analysis based on current market conditions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 