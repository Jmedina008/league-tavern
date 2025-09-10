'use client';

import { useState, useEffect } from 'react';

interface BettingLine {
  matchupId: string;
  team1: {
    name: string;
    owner: string;
    rosterId: string;
    projected: number;
  };
  team2: {
    name: string;
    owner: string;
    rosterId: string;
    projected: number;
  };
  spread: {
    favorite: string;
    line: number;
    odds: number;
  };
  total: {
    over: number;
    under: number;
    line: number;
  };
  moneyline: {
    team1Odds: number;
    team2Odds: number;
  };
}

interface UseBettingDataReturn {
  bettingLines: BettingLine[];
  userBalance: number;
  isLinesLocked: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBettingData(currentWeek: number): UseBettingDataReturn {
  const [bettingLines, setBettingLines] = useState<BettingLine[]>([]);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isLinesLocked, setIsLinesLocked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBettingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch betting lines
      const linesResponse = await fetch(`/api/betting/lines/${currentWeek}`, {
        next: { revalidate: 60 } // Cache for 1 minute
      });

      if (!linesResponse.ok) {
        throw new Error('Failed to fetch betting lines');
      }

      const linesData = await linesResponse.json();

      // Fetch user balance
      const balanceResponse = await fetch('/api/betting/balance');
      let balance = 100; // Default balance
      
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        balance = balanceData.balance;
      }

      // Check if lines are locked (Thursday 8:20 PM ET)
      const now = new Date();
      const lockTime = getThursdayLockTime();
      const locked = now >= lockTime;

      setBettingLines(linesData.lines || []);
      setUserBalance(balance);
      setIsLinesLocked(locked);
    } catch (err) {
      console.error('Error fetching betting data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchBettingData();
  };

  useEffect(() => {
    fetchBettingData();

    // Refresh data every 60 seconds
    const interval = setInterval(fetchBettingData, 60000);

    return () => clearInterval(interval);
  }, [currentWeek]);

  return {
    bettingLines,
    userBalance,
    isLinesLocked,
    loading,
    error,
    refetch
  };
}

function getThursdayLockTime(): Date {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 4 = Thursday
  
  // Find next Thursday
  let daysUntilThursday = (4 - currentDay + 7) % 7;
  if (daysUntilThursday === 0 && now.getHours() >= 20 && now.getMinutes() >= 20) {
    // If it's Thursday after 8:20 PM, get next Thursday
    daysUntilThursday = 7;
  }
  
  const thursday = new Date(now);
  thursday.setDate(now.getDate() + daysUntilThursday);
  thursday.setHours(20, 20, 0, 0); // 8:20 PM ET
  
  return thursday;
}
