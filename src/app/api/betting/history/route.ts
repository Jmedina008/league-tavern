import { NextResponse } from 'next/server';
import { getUserBets, getUserBalance } from '@/lib/db';

export async function GET() {
  try {
    // For now, we'll use a mock user ID since we don't have authentication yet
    const mockUserId = 'user_1';
    
    // Get user's betting history
    const bets = await getUserBets(mockUserId);
    
    // Calculate statistics
    const stats = calculateBettingStats(bets);
    
    return NextResponse.json({
      bets,
      stats,
      userId: mockUserId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching betting history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch betting history' },
      { status: 500 }
    );
  }
}

function calculateBettingStats(bets: any[]) {
  if (bets.length === 0) {
    return {
      totalBets: 0,
      totalStake: 0,
      totalPayout: 0,
      netProfit: 0,
      winRate: 0,
      pendingBets: 0,
      pendingStake: 0
    };
  }

  const settledBets = bets.filter(bet => bet.status !== 'PENDING');
  const pendingBets = bets.filter(bet => bet.status === 'PENDING');
  
  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalPayout = settledBets.reduce((sum, bet) => {
    if (bet.status === 'WON') return sum + (bet.actualPayout || bet.potentialPayout);
    if (bet.status === 'PUSH') return sum + bet.stake; // Return stake on push
    return sum; // Lost bets return 0
  }, 0);
  
  const settledStake = settledBets.reduce((sum, bet) => sum + bet.stake, 0);
  const netProfit = totalPayout - settledStake;
  
  const wonBets = settledBets.filter(bet => bet.status === 'WON').length;
  const winRate = settledBets.length > 0 ? (wonBets / settledBets.length) * 100 : 0;
  
  const pendingStake = pendingBets.reduce((sum, bet) => sum + bet.stake, 0);

  return {
    totalBets: bets.length,
    totalStake,
    totalPayout,
    netProfit,
    winRate,
    pendingBets: pendingBets.length,
    pendingStake
  };
}
