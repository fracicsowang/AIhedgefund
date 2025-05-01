import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={null} />
      
      <main className="flex-grow">
        {/* 关于我们标题部分 */}
        <section className="bg-blue-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">关于我们</h1>
              <p className="text-xl">
                AI Hedge Fund是您的智能投资助手，融合多位投资大师的策略，为您提供更明智的投资决策。
              </p>
            </div>
          </div>
        </section>
        
        {/* 我们的使命 */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">我们的使命</h2>
              <p className="text-lg text-gray-700 mb-6">
                我们的使命是通过人工智能技术，将投资领域最优秀的思想和策略带给每一位投资者，无论他们的经验水平或资金规模如何。
              </p>
              <p className="text-lg text-gray-700 mb-6">
                传统上，获取高质量的投资建议需要支付高昂的咨询费或自行钻研复杂的投资理论。AI Hedge Fund改变了这一点 - 我们相信每个人都应该有机会接触到优质的投资智慧。
              </p>
              <p className="text-lg text-gray-700">
                通过结合多位投资大师的策略和最先进的AI技术，我们提供全面、平衡的投资分析，帮助用户在复杂多变的市场中做出更加明智的决策。
              </p>
            </div>
          </div>
        </section>
        
        {/* 我们的团队 */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">我们的团队</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* 团队成员 1 */}
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-4 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-4xl">👨‍💼</div>
                </div>
                <h3 className="text-xl font-bold mb-1">张明</h3>
                <p className="text-blue-900 mb-3">首席执行官</p>
                <p className="text-gray-600 text-sm">
                  前华尔街对冲基金经理，拥有15年金融市场经验，专注于将AI技术应用于投资决策。
                </p>
              </div>
              
              {/* 团队成员 2 */}
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-4 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-4xl">👩‍💻</div>
                </div>
                <h3 className="text-xl font-bold mb-1">李芳</h3>
                <p className="text-blue-900 mb-3">首席技术官</p>
                <p className="text-gray-600 text-sm">
                  人工智能专家，曾在多家科技巨头担任要职，负责设计和优化我们的AI模型和算法。
                </p>
              </div>
              
              {/* 团队成员 3 */}
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-4 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-4xl">👨‍🔬</div>
                </div>
                <h3 className="text-xl font-bold mb-1">王浩</h3>
                <p className="text-blue-900 mb-3">首席研究员</p>
                <p className="text-gray-600 text-sm">
                  金融博士，专注于量化投资研究，负责将投资大师的策略转化为可量化的算法模型。
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* 投资大师 */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">我们模拟的投资大师</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">沃伦·巴菲特</h3>
                <p className="text-gray-600 text-sm">
                  价值投资的代表人物，专注于寻找具有持久竞争优势的优质企业，注重长期持有。
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">本杰明·格雷厄姆</h3>
                <p className="text-gray-600 text-sm">
                  价值投资之父，强调安全边际，寻找被低估的股票，注重公司内在价值。
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">彼得·林奇</h3>
                <p className="text-gray-600 text-sm">
                  成长型投资专家，偏好投资于能够持续增长的公司，强调实地调研和对行业的深入了解。
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">查理·芒格</h3>
                <p className="text-gray-600 text-sm">
                  多元思维模型的倡导者，注重质量而非数量，寻找具有经济护城河的企业。
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">乔治·索罗斯</h3>
                <p className="text-gray-600 text-sm">
                  全球宏观投资者，擅长识别市场趋势和拐点，强调市场反身性理论。
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">杰克·博格尔</h3>
                <p className="text-gray-600 text-sm">
                  指数投资的先驱，强调低成本、多样化和长期投资的重要性。
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* 联系我们 */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">联系我们</h2>
              <p className="text-lg text-gray-700 mb-8">
                有任何问题或建议？我们很乐意听取您的意见！
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
                发送消息
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 