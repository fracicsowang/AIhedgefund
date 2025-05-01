'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/lib/auth';

interface NavbarProps {
  user: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-900">
              AI Hedge Fund
            </Link>
          </div>
          
          {/* 桌面导航 */}
          <div className="hidden md:flex space-x-6">
            <Link href="/stocks" className="text-gray-700 hover:text-blue-900">
              股票分析
            </Link>
            {user && (
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-900">
                我的账户
              </Link>
            )}
            <Link href="/pricing" className="text-gray-700 hover:text-blue-900">
              订阅方案
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-900">
              关于我们
            </Link>
          </div>
          
          {/* 移动菜单按钮 */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-700 focus:outline-none"
              aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user.email}</span>
                <button 
                  onClick={() => signOut()} 
                  className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  登出
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <button className="text-blue-900 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors">
                    登录
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors">
                    注册
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* 移动导航菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link href="/stocks" className="text-gray-700 hover:text-blue-900 py-2">
                股票分析
              </Link>
              {user && (
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-900 py-2">
                  我的账户
                </Link>
              )}
              <Link href="/pricing" className="text-gray-700 hover:text-blue-900 py-2">
                订阅方案
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-900 py-2">
                关于我们
              </Link>
              
              <div className="pt-3 border-t border-gray-200">
                {user ? (
                  <div className="flex flex-col space-y-3">
                    <span className="text-gray-700">{user.email}</span>
                    <button 
                      onClick={() => signOut()} 
                      className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors w-full text-left"
                    >
                      登出
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link href="/login">
                      <button className="text-blue-900 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors w-full text-left">
                        登录
                      </button>
                    </Link>
                    <Link href="/signup">
                      <button className="bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors w-full text-left">
                        注册
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 