'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Receipt, Trash2, DollarSign, Calculator, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SelectedBet {
  matchupId: string;
  betType: 'spread' | 'total' | 'moneyline';
  selection: string;
  odds: number;
  line?: number;
  team?: string;
}

interface BetWithStake extends SelectedBet {
  stake: number;
  potentialPayout: number;
}

interface BetSlipProps {
  selectedBets: SelectedBet[];
  userBalance: number;
  onClearBets: () => void;
  disabled: boolean;
}

export default function BetSlip({ selectedBets, userBalance, onClearBets, disabled }: BetSlipProps) {
  const [stakes, setStakes] = useState<Record<string, number>>({});
  const [isPlacingBets, setIsPlacingBets] = useState(false);

  // Calculate potential payout based on odds
  const calculatePayout = (stake: number, odds: number): number => {
    if (odds > 0) {
      return stake + (stake * odds) / 100;
    } else {
      return stake + (stake * 100) / Math.abs(odds);
    }
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const getBetDescription = (bet: SelectedBet): string => {
    switch (bet.betType) {
      case 'spread':
        return `${bet.team} ${bet.line && bet.line > 0 ? '+' : ''}${bet.line}`;
      case 'total':
        return `${bet.selection === 'over' ? 'Over' : 'Under'} ${bet.line}`;
      case 'moneyline':
        return `${bet.team} Win`;
      default:
        return 'Unknown bet';
    }
  };

  const betKey = (bet: SelectedBet) => `${bet.matchupId}-${bet.betType}-${bet.selection}`;

  const betsWithStakes: BetWithStake[] = useMemo(() => {
    return selectedBets.map(bet => {
      const key = betKey(bet);
      const stake = stakes[key] || 0;
      return {
        ...bet,
        stake,
        potentialPayout: stake > 0 ? calculatePayout(stake, bet.odds) : 0
      };
    });
  }, [selectedBets, stakes]);

  const totalStake = useMemo(() => {
    return betsWithStakes.reduce((sum, bet) => sum + bet.stake, 0);
  }, [betsWithStakes]);

  const totalPotentialPayout = useMemo(() => {
    return betsWithStakes.reduce((sum, bet) => sum + bet.potentialPayout, 0);
  }, [betsWithStakes]);

  const totalPotentialProfit = totalPotentialPayout - totalStake;

  const hasValidBets = betsWithStakes.some(bet => bet.stake > 0);
  const exceedsBalance = totalStake > userBalance;
  const hasInvalidStakes = betsWithStakes.some(bet => bet.stake < 0);

  const handleStakeChange = (bet: SelectedBet, value: string) => {
    const numValue = parseFloat(value) || 0;
    const key = betKey(bet);
    setStakes(prev => ({
      ...prev,
      [key]: Math.max(0, numValue) // Ensure non-negative
    }));
  };

  const handleQuickStake = (bet: SelectedBet, amount: number) => {
    const key = betKey(bet);
    setStakes(prev => ({
      ...prev,
      [key]: amount
    }));
  };

  const handlePlaceBets = async () => {
    if (!hasValidBets || exceedsBalance || disabled) return;

    const validBets = betsWithStakes.filter(bet => bet.stake > 0);
    
    try {
      setIsPlacingBets(true);
      
      const response = await fetch('/api/betting/place-bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bets: validBets })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place bets');
      }

      const result = await response.json();
      
      toast.success(`Successfully placed ${validBets.length} bet${validBets.length > 1 ? 's' : ''}!`, {
        description: `Total stake: $${totalStake} • Potential payout: $${totalPotentialPayout.toFixed(2)}`
      });

      // Clear the bet slip
      onClearBets();
      setStakes({});

    } catch (error) {
      console.error('Error placing bets:', error);
      toast.error('Failed to place bets', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsPlacingBets(false);
    }
  };

  if (selectedBets.length === 0) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Bet Slip</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No bets selected</p>
            <p className="text-sm text-gray-400">Click on betting lines to add them here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Bet Slip ({selectedBets.length})</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearBets}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Individual Bets */}
        <div className="space-y-3">
          {selectedBets.map((bet) => {
            const key = betKey(bet);
            const stake = stakes[key] || 0;
            const payout = stake > 0 ? calculatePayout(stake, bet.odds) : 0;

            return (
              <div key={key} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">
                    {getBetDescription(bet)}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatOdds(bet.odds)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Stake"
                      value={stakes[key] || ''}
                      onChange={(e) => handleStakeChange(bet, e.target.value)}
                      disabled={disabled}
                      min="0"
                      step="1"
                      className="h-8 text-sm"
                    />
                    <span className="text-xs text-gray-500">FAAB</span>
                  </div>

                  {/* Quick stake buttons */}
                  <div className="flex space-x-1">
                    {[5, 10, 25].map(amount => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleQuickStake(bet, amount)}
                        disabled={disabled || amount > userBalance}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>

                  {stake > 0 && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Potential Payout:</span>
                        <span className="font-medium">${payout.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Potential Profit:</span>
                        <span className={`font-medium ${
                          payout > stake ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          ${(payout - stake).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {hasValidBets && (
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Total Stake:</span>
              <span className="font-medium">${totalStake}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Potential Payout:</span>
              <span className="font-medium">${totalPotentialPayout.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Potential Profit:</span>
              <span className={`font-medium ${
                totalPotentialProfit > 0 ? 'text-green-600' : 'text-gray-600'
              }`}>
                ${totalPotentialProfit.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Validation Messages */}
        {exceedsBalance && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Total stake (${totalStake}) exceeds your FAAB balance (${userBalance})
            </AlertDescription>
          </Alert>
        )}

        {/* Place Bets Button */}
        <Button
          onClick={handlePlaceBets}
          disabled={!hasValidBets || exceedsBalance || hasInvalidStakes || disabled || isPlacingBets}
          className="w-full"
        >
          <Calculator className="h-4 w-4 mr-2" />
          {isPlacingBets ? 'Placing Bets...' : `Place Bets ($${totalStake})`}
        </Button>

        {disabled && (
          <p className="text-xs text-center text-gray-500">
            Betting is currently locked
          </p>
        )}
      </CardContent>
    </Card>
  );
}
