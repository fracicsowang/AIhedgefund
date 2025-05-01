export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
          subscription: 'free' | 'basic' | 'premium';
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
          subscription?: 'free' | 'basic' | 'premium';
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
          subscription?: 'free' | 'basic' | 'premium';
        };
      };
      trade_recommendations: {
        Row: {
          id: string;
          symbol: string;
          agent_name: string;
          decision: 'BUY' | 'SELL' | 'HOLD';
          reasoning: string;
          confidence: number;
          timestamp: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          symbol: string;
          agent_name: string;
          decision: 'BUY' | 'SELL' | 'HOLD';
          reasoning: string;
          confidence: number;
          timestamp?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          symbol?: string;
          agent_name?: string;
          decision?: 'BUY' | 'SELL' | 'HOLD';
          reasoning?: string;
          confidence?: number;
          timestamp?: string;
          user_id?: string;
        };
      };
      portfolio_decisions: {
        Row: {
          id: string;
          symbol: string;
          final_decision: 'BUY' | 'SELL' | 'HOLD';
          confidence: number;
          reasoning: string;
          timestamp: string;
          user_id: string;
          fundamentals: Json;
          sentiment: Json;
          technicals: Json;
        };
        Insert: {
          id?: string;
          symbol: string;
          final_decision: 'BUY' | 'SELL' | 'HOLD';
          confidence: number;
          reasoning: string;
          timestamp?: string;
          user_id: string;
          fundamentals: Json;
          sentiment: Json;
          technicals: Json;
        };
        Update: {
          id?: string;
          symbol?: string;
          final_decision?: 'BUY' | 'SELL' | 'HOLD';
          confidence?: number;
          reasoning?: string;
          timestamp?: string;
          user_id?: string;
          fundamentals?: Json;
          sentiment?: Json;
          technicals?: Json;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      subscription_status: 'free' | 'basic' | 'premium';
      decision_type: 'BUY' | 'SELL' | 'HOLD';
    };
  };
} 