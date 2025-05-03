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
            <Link href="/" className="flex items-center text-xl font-bold text-blue-900">
              <img src="/logo.png" alt="Legend AI Logo" className="h-8 w-8 mr-2" />
              Legend AI
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex space-x-6">
            <Link href="/stocks" className="text-gray-700 hover:text-blue-900">
              Stock Analysis
            </Link>
            {user && (
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-900">
                My Account
              </Link>
            )}
            <Link href="/about" className="text-gray-700 hover:text-blue-900">
              About Us
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-700 focus:outline-none"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
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
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <button className="text-blue-900 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors">
                    Login
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile navigation menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link href="/stocks" className="text-gray-700 hover:text-blue-900 py-2">
                Stock Analysis
              </Link>
              {user && (
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-900 py-2">
                  My Account
                </Link>
              )}
              <Link href="/about" className="text-gray-700 hover:text-blue-900 py-2">
                About Us
              </Link>
              
              <div className="pt-3 border-t border-gray-200">
                {user ? (
                  <div className="flex flex-col space-y-3">
                    <span className="text-gray-700">{user.email}</span>
                    <button 
                      onClick={() => signOut()} 
                      className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors w-full text-left"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link href="/login">
                      <button className="text-blue-900 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors w-full text-left">
                        Login
                      </button>
                    </Link>
                    <Link href="/signup">
                      <button className="bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors w-full text-left">
                        Sign Up
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