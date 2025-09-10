'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, DollarSign, TrendingUp, Lock } from 'lucide-react';
import BettingLines from '@/components/betting/BettingLines';
import BetSlip from '@/components/betting/BetSlip';
import UserBalance from '@/components/betting/UserBalance';
import { useBettingData } from '@/hooks/useBettingData';

interface BettingContentProps {
  currentWeek: number;
}

export default function BettingContent({ currentWeek }: BettingContentProps) {
  const [selectedBets, setSelectedBets] = useState<any[]>([]);
  const { 
    bettingLines, 
    userBalance, 
    isLinesLocked, 
    loading, 
    error 
  } = useBettingData(currentWeek);

  const handleBetSelection = (bet: any) => {
    setSelectedBets(prev => {
      const existingBetIndex = prev.findIndex(b => 
        b.matchupId === bet.matchupId && b.betType === bet.betType
      );

      if (existingBetIndex >= 0) {
        // Remove existing bet of same type for same matchup
        return prev.filter((_, index) => index !== existingBetIndex);
      } else {
        // Add new bet
        return [...prev, bet];
      }
    });
  };

  const handleClearBets = () => {
    setSelectedBets([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading betting lines...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="max-w-2xl">
        <AlertDescription>
          Unable to load betting lines. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isLinesLocked ? (
                  <>
                    <Lock className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-red-700">Lines Locked</span>
                    <Badge variant="destructive">BETTING CLOSED</Badge>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-700">Lines Open</span>
                    <Badge variant="default" className="bg-green-600">BETTING OPEN</Badge>
                  </>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Week {currentWeek} • Lines lock Thursday 8:20 PM ET
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <UserBalance balance={userBalance} />
              <Link 
                href="/betting/history" 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View History
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLinesLocked && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Betting is currently locked. Lines will reopen after this week's games are completed.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Betting Lines */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Week {currentWeek} Betting Lines</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BettingLines
                lines={bettingLines}
                onBetSelect={handleBetSelection}
                selectedBets={selectedBets}
                disabled={isLinesLocked}
              />
            </CardContent>
          </Card>
        </div>

        {/* Bet Slip */}
        <div>
          <BetSlip
            selectedBets={selectedBets}
            userBalance={userBalance}
            onClearBets={handleClearBets}
            disabled={isLinesLocked}
          />
        </div>
      </div>
    </div>
  );
}
