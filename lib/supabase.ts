import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Ensure environment variables exist
// Note: In Next.js 15+, environment variables may be accessed differently in client and server components
// Default values are provided for development or testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ycnvrgvzmpkiqhnkfkdz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbnZyZ3Z6bXBraXFobmtma2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4OTA2MjEsImV4cCI6MjA2MTQ2NjYyMX0.hX7DNpbhVh1q9_MAuF_tkXC3gk1QnW14GzXMIyQFW4A';

// Validate environment variables - won't throw errors since we have defaults
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Warning: Missing Supabase environment variables. Using defaults, which may not be what you want.');
}

// Create Supabase client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Server-side Supabase client creation function (with service role key)
export const createServerSupabaseClient = () => {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbnZyZ3Z6bXBraXFobmtma2R6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTg5MDYyMSwiZXhwIjoyMDYxNDY2NjIxfQ.Ow1H-0LC-SqSpZVzkC8NTwdTZKs_3mL8vTVdF5MuTXE';
  
  if (!supabaseServiceRoleKey) {
    console.warn('Warning: Missing Supabase service role key. Some server-side features may be unavailable.');
    // Return client with anonymous key instead of throwing error
    return createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  
  return createClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

/**
 * User registration
 * @param email User email
 * @param password Password
 */
export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

/**
 * User login
 * @param email User email
 * @param password Password
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

/**
 * User logout
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Get user subscription status
 * @param userId User ID
 */
export async function getUserSubscription(userId: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If no record is found, default to free user
      if (error.code === 'PGRST116') {
        return { subscription_status: 'free' };
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to get user subscription status:', error);
    return { subscription_status: 'free' };
  }
} 