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
    
    // Validate form
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    try {
      setLoading(true);
      const { data, error: signUpError } = await signUp(email, password);
      
      if (signUpError) {
        throw signUpError;
      }
      
      // Registration successful, redirect to dashboard or confirmation page
      router.push('/login?registered=true');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed, please try again later');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={null} />
      
      <main className="flex-grow">
        <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Set a password (8+ characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password again"
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
                {loading ? 'Signing up...' : 'Sign Up Free'}
              </button>
            </div>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              Already have an account?
              <Link href="/login" className="text-blue-900 hover:text-blue-700 ml-1">
                Login
              </Link>
            </p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500">
            <p>
              By signing up, you agree to our
              <Link href="/terms" className="text-blue-900 hover:text-blue-700 mx-1">
                Terms of Service
              </Link>
              and
              <Link href="/privacy" className="text-blue-900 hover:text-blue-700 mx-1">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 