'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth';

export default function ClientAuthProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return <AuthProvider>{children}</AuthProvider>;
} 