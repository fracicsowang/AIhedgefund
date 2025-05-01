import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={null} />
      
      <main className="flex-grow">
        {/* About Us Hero Section */}
        <section className="bg-blue-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">About Us</h1>
              <p className="text-xl">
                AI Hedge Fund is your intelligent investment assistant, combining strategies from multiple investment masters to provide you with smarter investment decisions.
              </p>
            </div>
          </div>
        </section>
        
        {/* Our Mission */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6">
                Our mission is to leverage artificial intelligence to bring the best investment thinking and strategies to every investor, regardless of their experience level or financial resources.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Traditionally, obtaining high-quality investment advice required paying expensive consulting fees or studying complex investment theories. AI Hedge Fund changes that - we believe everyone should have access to quality investment wisdom.
              </p>
              <p className="text-lg text-gray-700">
                By combining strategies from multiple investment masters with cutting-edge AI technology, we provide comprehensive, balanced investment analysis to help users make smarter decisions in complex and volatile markets.
              </p>
            </div>
          </div>
        </section>
        
        {/* Our Team */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Team</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Team Member 1 */}
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-blue-100 mx-auto mb-4 overflow-hidden flex items-center justify-center">
                  <svg className="w-16 h-16 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-1">Michael Johnson</h3>
                <p className="text-blue-900 mb-3">Chief Executive Officer</p>
                <p className="text-gray-600 text-sm">
                  Former Wall Street hedge fund manager with 15 years of experience in financial markets, focused on applying AI technology to investment decisions.
                </p>
              </div>
              
              {/* Team Member 2 */}
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-blue-100 mx-auto mb-4 overflow-hidden flex items-center justify-center">
                  <svg className="w-16 h-16 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-1">Sarah Chen</h3>
                <p className="text-blue-900 mb-3">Chief Technology Officer</p>
                <p className="text-gray-600 text-sm">
                  AI expert who has held key positions at several tech giants, responsible for designing and optimizing our AI models and algorithms.
                </p>
              </div>
              
              {/* Team Member 3 */}
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-blue-100 mx-auto mb-4 overflow-hidden flex items-center justify-center">
                  <svg className="w-16 h-16 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-1">David Reynolds</h3>
                <p className="text-blue-900 mb-3">Chief Research Officer</p>
                <p className="text-gray-600 text-sm">
                  Finance PhD focused on quantitative investment research, responsible for transforming investment master strategies into quantifiable algorithmic models.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Investment Masters */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Investment Masters We Model</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">Warren Buffett</h3>
                <p className="text-gray-600 text-sm">
                  Icon of value investing who focuses on finding quality companies with enduring competitive advantages and emphasizes long-term holding.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">Benjamin Graham</h3>
                <p className="text-gray-600 text-sm">
                  Father of value investing who emphasizes margin of safety, seeks undervalued stocks, and focuses on a company's intrinsic value.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">Peter Lynch</h3>
                <p className="text-gray-600 text-sm">
                  Growth investment expert who prefers investing in companies with sustainable growth, emphasizing field research and deep industry understanding.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">Charlie Munger</h3>
                <p className="text-gray-600 text-sm">
                  Advocate of multidisciplinary thinking models who emphasizes quality over quantity and seeks businesses with economic moats.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">George Soros</h3>
                <p className="text-gray-600 text-sm">
                  Global macro investor skilled at identifying market trends and turning points, emphasizing market reflexivity theory.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">Jack Bogle</h3>
                <p className="text-gray-600 text-sm">
                  Pioneer of index investing who emphasizes the importance of low costs, diversification, and long-term investing.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Contact Us */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
              <p className="text-lg text-gray-700 mb-8">
                Have any questions or suggestions? We'd love to hear from you!
              </p>
              
              <div className="flex flex-col md:flex-row justify-center gap-6 mb-8">
                <div className="flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-900 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span>support@aihedgefund.com</span>
                </div>
                
                <div className="flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-900 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span>400-888-7777</span>
                </div>
              </div>
              
              <button className="bg-blue-900 text-white font-bold py-3 px-8 rounded-md hover:bg-blue-800 transition-colors">
                Send Message
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 