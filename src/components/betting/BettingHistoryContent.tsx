'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  History, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Filter
} from 'lucide-react';

interface Bet {
  id: string;
  matchupId: string;
  betType: 'spread' | 'total' | 'moneyline';
  selection: string;
  stake: number;
  odds: number;
  line?: number;
  team?: string;
  potentialPayout: number;
  status: 'PENDING' | 'WON' | 'LOST' | 'PUSH';
  placedAt: string;
  settledAt?: string;
  actualPayout?: number;
  week: number;
}

interface BettingStats {
  totalBets: number;
  totalStake: number;
  totalPayout: number;
  netProfit: number;
  winRate: number;
  pendingBets: number;
  pendingStake: number;
}

type FilterStatus = 'ALL' | 'PENDING' | 'WON' | 'LOST' | 'PUSH';

export default function BettingHistoryContent() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [stats, setStats] = useState<BettingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');

  useEffect(() => {
    fetchBettingHistory();
  }, []);

  const fetchBettingHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/betting/history');
      if (!response.ok) {
        throw new Error('Failed to fetch betting history');
      }

      const data = await response.json();
      setBets(data.bets || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error('Error fetching betting history:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredBets = bets.filter(bet => {
    if (filterStatus !== 'ALL' && bet.status !== filterStatus) return false;
    if (selectedWeek !== 'all' && bet.week !== selectedWeek) return false;
    return true;
  });

  const getStatusIcon = (status: Bet['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'WON':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'LOST':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PUSH':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: Bet['status']) => {
    const variants = {
      PENDING: 'default',
      WON: 'default',
      LOST: 'destructive',
      PUSH: 'secondary'
    } as const;

    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      WON: 'bg-green-100 text-green-800',
      LOST: 'bg-red-100 text-red-800',
      PUSH: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[status]}>
        {status}
      </Badge>
    );
  };

  const getBetDescription = (bet: Bet): string => {
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

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const availableWeeks = [...new Set(bets.map(bet => bet.week))].sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading betting history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="max-w-2xl">
        <AlertDescription>
          Unable to load betting history. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <History className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Bets</p>
                  <p className="text-2xl font-bold">{stats.totalBets}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Net Profit</p>
                  <p className={`text-2xl font-bold ${
                    stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.netProfit >= 0 ? '+' : ''}${stats.netProfit.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                {stats.winRate >= 50 ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="text-sm text-gray-600">Win Rate</p>
                  <p className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">${stats.pendingStake}</p>
                  <p className="text-xs text-gray-500">{stats.pendingBets} bets</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="flex flex-wrap gap-2">
                {(['ALL', 'PENDING', 'WON', 'LOST', 'PUSH'] as FilterStatus[]).map(status => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            {/* Week Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Week</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedWeek === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedWeek('all')}
                >
                  All Weeks
                </Button>
                {availableWeeks.map(week => (
                  <Button
                    key={week}
                    variant={selectedWeek === week ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedWeek(week)}
                  >
                    Week {week}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Betting History */}
      <Card>
        <CardHeader>
          <CardTitle>
            Betting History ({filteredBets.length} bet{filteredBets.length !== 1 ? 's' : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBets.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {bets.length === 0 
                  ? "You haven't placed any bets yet."
                  : "No bets match the selected filters."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBets.map((bet) => (
                <div key={bet.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(bet.status)}
                        <span className="font-medium text-lg">
                          {getBetDescription(bet)}
                        </span>
                        {getStatusBadge(bet.status)}
                        <Badge variant="outline">Week {bet.week}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Stake:</span>
                          <span className="ml-1 font-medium">${bet.stake}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Odds:</span>
                          <span className="ml-1 font-medium">{formatOdds(bet.odds)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Potential:</span>
                          <span className="ml-1 font-medium">${bet.potentialPayout.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Result:</span>
                          <span className={`ml-1 font-medium ${
                            bet.status === 'WON' ? 'text-green-600' :
                            bet.status === 'LOST' ? 'text-red-600' :
                            bet.status === 'PUSH' ? 'text-gray-600' :
                            'text-yellow-600'
                          }`}>
                            {bet.status === 'PENDING' ? 'Pending' :
                             bet.status === 'PUSH' ? '$0.00' :
                             bet.actualPayout ? `$${bet.actualPayout.toFixed(2)}` : '-'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        <span>Placed: {formatDate(bet.placedAt)}</span>
                        {bet.settledAt && (
                          <span className="ml-4">Settled: {formatDate(bet.settledAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
