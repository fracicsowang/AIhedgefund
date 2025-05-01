import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// 确保环境变量存在
// 注意：Next.js 15+中，环境变量可能在客户端组件和服务器组件中访问方式不同
// 默认值用于开发环境或测试
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ycnvrgvzmpkiqhnkfkdz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbnZyZ3Z6bXBraXFobmtma2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4OTA2MjEsImV4cCI6MjA2MTQ2NjYyMX0.hX7DNpbhVh1q9_MAuF_tkXC3gk1QnW14GzXMIyQFW4A';

// 验证环境变量 - 有默认值，所以不会抛出错误
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('警告：缺少Supabase环境变量。使用默认值，这可能不是您想要的。');
}

// 创建Supabase客户端
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// 服务端Supabase客户端创建函数（带服务角色密钥）
export const createServerSupabaseClient = () => {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbnZyZ3Z6bXBraXFobmtma2R6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTg5MDYyMSwiZXhwIjoyMDYxNDY2NjIxfQ.Ow1H-0LC-SqSpZVzkC8NTwdTZKs_3mL8vTVdF5MuTXE';
  
  if (!supabaseServiceRoleKey) {
    console.warn('警告：缺少Supabase服务角色密钥。某些服务器端功能可能不可用。');
    // 返回使用匿名密钥的客户端，而不是抛出错误
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
 * 用户注册
 * @param email 用户邮箱
 * @param password 密码
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
    console.error('注册失败:', error);
    throw error;
  }
}

/**
 * 用户登录
 * @param email 用户邮箱
 * @param password 密码
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
    console.error('登录失败:', error);
    throw error;
  }
}

/**
 * 用户登出
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('登出失败:', error);
    throw error;
  }
}

/**
 * 获取当前用户
 */
export async function getCurrentUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user;
  } catch (error) {
    console.error('获取当前用户失败:', error);
    return null;
  }
}

/**
 * 获取用户订阅状态
 * @param userId 用户ID
 */
export async function getUserSubscription(userId: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // 如果没有找到记录，默认为免费用户
      if (error.code === 'PGRST116') {
        return { subscription_status: 'free' };
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('获取用户订阅状态失败:', error);
    return { subscription_status: 'free' };
  }
} 