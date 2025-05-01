import { NextRequest, NextResponse } from 'next/server';
import { fetchStockData } from '@/lib/fetchStockData';
import { benGrahamStrategy } from '@/agents/benGraham';
import { warrenBuffettStrategy } from '@/agents/warrenBuffett';
import { TradeRecommendation } from '@/types';
import { getCurrentUser, getUserSubscription } from '@/lib/supabase';

// Investment Agent mapping table
const AGENTS: Record<string, (stockData: any) => { decision: 'BUY' | 'SELL' | 'HOLD', reasoning: string }> = {
  'benGraham': benGrahamStrategy,
  'warrenBuffett': warrenBuffettStrategy,
  // More investment masters can be added later
};

export async function GET(request: NextRequest) {
  try {
    // Get parameters
    const symbol = request.nextUrl.searchParams.get('symbol');
    const agent = request.nextUrl.searchParams.get('agent');
    
    if (!symbol || !agent) {
      return NextResponse.json(
        { error: 'Missing required parameters: symbol or agent' },
        { status: 400 }
      );
    }
    
    // Verify agent exists
    if (!AGENTS[agent]) {
      return NextResponse.json(
        { error: `Investment expert not found: ${agent}` },
        { status: 400 }
      );
    }
    
    // Get current user (if logged in)
    const user = await getCurrentUser();
    
    // Check subscription status
    if (user) {
      const subscription = await getUserSubscription(user.id);
      
      // Define stocks and investment masters accessible to free users
      const freeStocks = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'META', 'NVDA', 'TSLA'];
      const freeAgents = ['benGraham']; // Free users can only access Benjamin Graham
      
      // If free user tries to access premium content
      if (subscription.subscription_status === 'free') {
        if (!freeStocks.includes(symbol.toUpperCase())) {
          return NextResponse.json(
            { error: 'Subscription required to view data for this stock' },
            { status: 403 }
          );
        }
        
        if (!freeAgents.includes(agent)) {
          return NextResponse.json(
            { error: 'Subscription required to access recommendations from this investment expert' },
            { status: 403 }
          );
        }
      }
    }
    
    // Get stock data
    const stockData = await fetchStockData(symbol);
    
    // Call the specified investment strategy to get decision
    const strategy = AGENTS[agent];
    const { decision, reasoning } = strategy(stockData);
    
    // Create trade recommendation response
    const recommendation: TradeRecommendation = {
      symbol: symbol.toUpperCase(),
      agentName: agent,
      decision,
      reasoning,
      confidence: calculateConfidence(decision, reasoning),
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(recommendation);
  } catch (error) {
    console.error('Failed to get investment recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to get investment recommendation' },
      { status: 500 }
    );
  }
}

// Simple confidence calculation function
function calculateConfidence(decision: 'BUY' | 'SELL' | 'HOLD', reasoning: string): number {
  // Analyze certainty terms in reasoning to estimate confidence
  const highConfidenceTerms = ['clearly', 'strongly', 'significantly', 'very', 'extremely', 'definitively'];
  const lowConfidenceTerms = ['possibly', 'perhaps', 'maybe', 'uncertain', 'unclear'];
  
  let confidence = 0.7; // Default confidence
  
  // Adjust base confidence based on decision type
  if (decision === 'HOLD') {
    confidence = 0.5; // Hold typically indicates less certainty
  }
  
  // Adjust confidence based on certainty terms in reasoning text
  const reasoningLower = reasoning.toLowerCase();
  highConfidenceTerms.forEach(term => {
    if (reasoningLower.includes(term)) confidence += 0.05;
  });
  
  lowConfidenceTerms.forEach(term => {
    if (reasoningLower.includes(term)) confidence -= 0.1;
  });
  
  // Ensure confidence is in the 0-1 range
  return Math.max(0.1, Math.min(0.95, confidence));
} 