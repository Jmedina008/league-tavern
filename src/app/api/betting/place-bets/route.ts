import { NextResponse } from 'next/server';
import { placeBetNew, getUserBalance } from '@/lib/db';

interface BetRequest {
  matchupId: string;
  betType: 'spread' | 'total' | 'moneyline';
  selection: string;
  odds: number;
  stake: number;
  line?: number;
  team?: string;
  potentialPayout: number;
}

export async function POST(request: Request) {
  try {
    const { bets }: { bets: BetRequest[] } = await request.json();
    
    if (!bets || !Array.isArray(bets) || bets.length === 0) {
      return NextResponse.json(
        { error: 'No valid bets provided' },
        { status: 400 }
      );
    }

    // For now, we'll use a mock user ID since we don't have authentication yet
    const mockUserId = 'user_1';
    
    // Validate all bets before processing any
    const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
    const currentBalance = await getUserBalance(mockUserId);
    
    if (totalStake > currentBalance) {
      return NextResponse.json(
        { 
          error: 'Insufficient FAAB balance',
          details: `Total stake ($${totalStake}) exceeds balance ($${currentBalance})`
        },
        { status: 400 }
      );
    }

    // Validate individual bets
    for (const bet of bets) {
      if (bet.stake <= 0) {
        return NextResponse.json(
          { error: `Invalid stake amount: ${bet.stake}` },
          { status: 400 }
        );
      }
      
      if (!bet.matchupId || !bet.betType || !bet.selection) {
        return NextResponse.json(
          { error: 'Missing required bet information' },
          { status: 400 }
        );
      }
    }

    // Check if lines are currently locked (Thursday 8:20 PM ET)
    if (isLinesLocked()) {
      return NextResponse.json(
        { error: 'Betting is currently locked. Lines reopen after games complete.' },
        { status: 403 }
      );
    }

    // Place all bets
    const placedBets = [];
    
    for (const bet of bets) {
      try {
        const placedBet = await placeBetNew(mockUserId, {
          matchupId: bet.matchupId,
          betType: bet.betType,
          selection: bet.selection,
          stake: bet.stake,
          odds: bet.odds,
          line: bet.line,
          team: bet.team,
          potentialPayout: bet.potentialPayout
        });
        
        placedBets.push(placedBet);
      } catch (error) {
        console.error('Error placing individual bet:', error);
        // If any bet fails, we should ideally rollback previous bets
        // For now, we'll continue and report the error
      }
    }

    const updatedBalance = await getUserBalance(mockUserId);
    
    return NextResponse.json({
      success: true,
      betsPlaced: placedBets.length,
      totalBets: bets.length,
      totalStake,
      newBalance: updatedBalance,
      bets: placedBets,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error placing bets:', error);
    return NextResponse.json(
      { error: 'Failed to place bets' },
      { status: 500 }
    );
  }
}

function isLinesLocked(): boolean {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 4 = Thursday
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Lines lock Thursday at 8:20 PM ET (20:20) and reopen Monday
  if (currentDay === 4) { // Thursday
    return currentHour > 20 || (currentHour === 20 && currentMinute >= 20);
  } else if (currentDay === 5 || currentDay === 6 || currentDay === 0) { // Friday, Saturday, Sunday
    return true;
  }
  
  return false; // Monday, Tuesday, Wednesday - lines are open
}
