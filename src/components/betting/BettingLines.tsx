'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Target, Minus } from 'lucide-react';

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

interface SelectedBet {
  matchupId: string;
  betType: 'spread' | 'total' | 'moneyline';
  selection: string;
  odds: number;
  line?: number;
  team?: string;
}

interface BettingLinesProps {
  lines: BettingLine[];
  onBetSelect: (bet: SelectedBet) => void;
  selectedBets: SelectedBet[];
  disabled: boolean;
}

export default function BettingLines({ lines, onBetSelect, selectedBets, disabled }: BettingLinesProps) {
  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const isSelected = (matchupId: string, betType: string, selection: string) => {
    return selectedBets.some(bet => 
      bet.matchupId === matchupId && 
      bet.betType === betType && 
      bet.selection === selection
    );
  };

  const handleBetClick = (line: BettingLine, betType: 'spread' | 'total' | 'moneyline', selection: string, odds: number, lineValue?: number, team?: string) => {
    if (disabled) return;

    const bet: SelectedBet = {
      matchupId: line.matchupId,
      betType,
      selection,
      odds,
      line: lineValue,
      team
    };

    onBetSelect(bet);
  };

  if (lines.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No betting lines available for this week yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lines.map((line) => (
        <Card key={line.matchupId} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="truncate">{line.team1.name}</span>
                  <span className="text-gray-400">vs</span>
                  <span className="truncate">{line.team2.name}</span>
                </div>
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <TrendingUp className="h-4 w-4" />
                <span>Proj: {line.team1.projected.toFixed(1)} - {line.team2.projected.toFixed(1)}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Team Names */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 border-b pb-2">
              <div>{line.team1.owner}</div>
              <div className="text-right">{line.team2.owner}</div>
            </div>

            {/* Spread Betting */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 flex items-center">
                <Minus className="h-4 w-4 mr-1" />
                Point Spread
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={isSelected(line.matchupId, 'spread', 'team1') ? 'default' : 'outline'}
                  disabled={disabled}
                  onClick={() => handleBetClick(line, 'spread', 'team1', line.spread.odds, line.spread.line, line.team1.name)}
                  className="h-auto py-2 px-3"
                >
                  <div className="text-center">
                    <div className="font-semibold">
                      {line.spread.favorite === line.team1.rosterId ? 
                        `-${line.spread.line}` : 
                        `+${line.spread.line}`
                      }
                    </div>
                    <div className="text-xs opacity-75">
                      {formatOdds(line.spread.odds)}
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant={isSelected(line.matchupId, 'spread', 'team2') ? 'default' : 'outline'}
                  disabled={disabled}
                  onClick={() => handleBetClick(line, 'spread', 'team2', line.spread.odds, -line.spread.line, line.team2.name)}
                  className="h-auto py-2 px-3"
                >
                  <div className="text-center">
                    <div className="font-semibold">
                      {line.spread.favorite === line.team2.rosterId ? 
                        `-${line.spread.line}` : 
                        `+${line.spread.line}`
                      }
                    </div>
                    <div className="text-xs opacity-75">
                      {formatOdds(line.spread.odds)}
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Total (Over/Under) */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Total Points
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={isSelected(line.matchupId, 'total', 'over') ? 'default' : 'outline'}
                  disabled={disabled}
                  onClick={() => handleBetClick(line, 'total', 'over', line.total.over, line.total.line)}
                  className="h-auto py-2 px-3"
                >
                  <div className="text-center">
                    <div className="font-semibold">Over {line.total.line}</div>
                    <div className="text-xs opacity-75">
                      {formatOdds(line.total.over)}
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant={isSelected(line.matchupId, 'total', 'under') ? 'default' : 'outline'}
                  disabled={disabled}
                  onClick={() => handleBetClick(line, 'total', 'under', line.total.under, line.total.line)}
                  className="h-auto py-2 px-3"
                >
                  <div className="text-center">
                    <div className="font-semibold">Under {line.total.line}</div>
                    <div className="text-xs opacity-75">
                      {formatOdds(line.total.under)}
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Moneyline */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 flex items-center">
                <Target className="h-4 w-4 mr-1" />
                Moneyline (Win/Loss)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={isSelected(line.matchupId, 'moneyline', 'team1') ? 'default' : 'outline'}
                  disabled={disabled}
                  onClick={() => handleBetClick(line, 'moneyline', 'team1', line.moneyline.team1Odds, undefined, line.team1.name)}
                  className="h-auto py-2 px-3"
                >
                  <div className="text-center">
                    <div className="font-semibold">Win</div>
                    <div className="text-xs opacity-75">
                      {formatOdds(line.moneyline.team1Odds)}
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant={isSelected(line.matchupId, 'moneyline', 'team2') ? 'default' : 'outline'}
                  disabled={disabled}
                  onClick={() => handleBetClick(line, 'moneyline', 'team2', line.moneyline.team2Odds, undefined, line.team2.name)}
                  className="h-auto py-2 px-3"
                >
                  <div className="text-center">
                    <div className="font-semibold">Win</div>
                    <div className="text-xs opacity-75">
                      {formatOdds(line.moneyline.team2Odds)}
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
