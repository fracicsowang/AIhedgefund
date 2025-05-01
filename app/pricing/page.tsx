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
              <h1 className="text-4xl font-bold mb-4">选择适合您的订阅方案</h1>
              <p className="text-xl text-gray-600">
                无论您是初学者还是资深投资人，我们都有适合您的方案
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* 免费方案 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4">免费版</h3>
                  <div className="text-4xl font-bold mb-4">¥0<span className="text-gray-500 text-base font-normal">/月</span></div>
                  <p className="text-gray-600 mb-6">适合初步了解AI投资顾问的用户</p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>访问7只热门股票</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>格雷厄姆投资策略</span>
                    </li>
                    <li className="flex items-center text-gray-400">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span>更多投资大师策略</span>
                    </li>
                    <li className="flex items-center text-gray-400">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span>更广泛的股票池</span>
                    </li>
                    <li className="flex items-center text-gray-400">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span>专业风险管理工具</span>
                    </li>
                  </ul>
                  
                  <Link href="/signup">
                    <button className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-md hover:bg-gray-300 transition-colors">
                      免费注册
                    </button>
                  </Link>
                </div>
              </div>
              
              {/* 基础方案 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden transform scale-105 z-10 border-2 border-blue-500">
                <div className="bg-blue-500 text-white py-2 text-center font-bold">
                  推荐方案
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4">基础版</h3>
                  <div className="text-4xl font-bold mb-4">¥59<span className="text-gray-500 text-base font-normal">/月</span></div>
                  <p className="text-gray-600 mb-6">适合个人投资者的优质选择</p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>所有免费版功能</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>5位投资大师策略</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>访问50+股票分析</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>基础风险管理工具</span>
                    </li>
                    <li className="flex items-center text-gray-400">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span>高级技术分析</span>
                    </li>
                  </ul>
                  
                  <Link href="/subscribe?plan=basic">
                    <button className="w-full bg-blue-900 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-800 transition-colors">
                      选择此方案
                    </button>
                  </Link>
                </div>
              </div>
              
              {/* 高级方案 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4">高级版</h3>
                  <div className="text-4xl font-bold mb-4">¥99<span className="text-gray-500 text-base font-normal">/月</span></div>
                  <p className="text-gray-600 mb-6">适合专业投资者的全功能选择</p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>所有基础版功能</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>9位投资大师完整策略</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>访问100+股票分析</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>高级风险管理工具</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>专业级技术分析指标</span>
                    </li>
                  </ul>
                  
                  <Link href="/subscribe?plan=premium">
                    <button className="w-full bg-gray-800 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-700 transition-colors">
                      选择此方案
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* 常见问题 */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">常见问题</h2>
            
            <div className="max-w-3xl mx-auto space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-2">如何选择合适的方案？</h3>
                <p className="text-gray-600">
                  如果您是初学者，可以先选择免费版熟悉我们的服务。对于有一定投资经验的用户，推荐选择基础版。而对于追求全面深入分析的专业投资者，高级版将提供最完整的服务。
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2">我可以随时更改或取消订阅吗？</h3>
                <p className="text-gray-600">
                  是的，您可以随时在账户设置中升级、降级或取消您的订阅。取消后，您的服务将持续到当前结算周期结束。
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2">有退款政策吗？</h3>
                <p className="text-gray-600">
                  我们提供14天的退款保证。如果您在订阅后14天内对服务不满意，可以联系我们的客服申请全额退款。
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2">投资建议是实时更新的吗？</h3>
                <p className="text-gray-600">
                  是的，我们的AI系统会根据最新的市场数据实时更新投资建议，确保您获得基于当前市场状况的分析。
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