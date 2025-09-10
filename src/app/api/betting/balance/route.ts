import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { syncUsers, getUserBalance } from '@/lib/db';

export async function GET() {
  try {
    // For now, we'll use a mock user ID since we don't have authentication yet
    // In a real implementation, you'd get this from session/auth
    const mockUserId = 'user_1'; // This should come from authentication
    
    // Sync users from Sleeper API (this ensures our DB is up to date)
    await syncUsers();
    
    // Get user's current FAAB balance
    const balance = await getUserBalance(mockUserId);
    
    return NextResponse.json({ 
      balance,
      userId: mockUserId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching user balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
