'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    // 验证表单
    if (!email || !password || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不匹配');
      return;
    }
    
    if (password.length < 8) {
      setError('密码长度必须至少为8个字符');
      return;
    }
    
    try {
      setLoading(true);
      const { data, error: signUpError } = await signUp(email, password);
      
      if (signUpError) {
        throw signUpError;
      }
      
      // 注册成功，跳转到仪表盘页面或确认邮件页面
      router.push('/login?registered=true');
    } catch (err: any) {
      console.error('注册失败:', err);
      setError(err.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={null} />
      
      <main className="flex-grow">
        <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">创建账户</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                电子邮箱
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="您的邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="设置密码（至少8位）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                确认密码
              </label>
              <input
                id="confirm-password"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? '注册中...' : '免费注册'}
              </button>
            </div>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              已有账户？
              <Link href="/login" className="text-blue-900 hover:text-blue-700 ml-1">
                登录
              </Link>
            </p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500">
            <p>
              注册即表示您同意我们的
              <Link href="/terms" className="text-blue-900 hover:text-blue-700 mx-1">
                服务条款
              </Link>
              和
              <Link href="/privacy" className="text-blue-900 hover:text-blue-700 mx-1">
                隐私政策
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 