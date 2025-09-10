'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Star,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

interface PlayerMatchup {
  player_id: string;
  name: string;
  position: string;
  team: string;
  opponent_rank?: number; // Defense ranking against position
  projected_points: number;
  floor: number;
  ceiling: number;
  recent_form: number[]; // Last 4 weeks
  matchup_grade: 'A' | 'B' | 'C' | 'D' | 'F';
  start_sit: 'MUST_START' | 'START' | 'FLEX' | 'BENCH' | 'AVOID';
  key_factors: string[];
  injury_status?: 'healthy' | 'questionable' | 'doubtful' | 'out';
}

interface TeamMatchup {
  team_id: string;
  team_name: string;
  owner_name: string;
  record: string;
  projected_total: number;
  key_players: PlayerMatchup[];
  lineup_decisions: LineupDecision[];
  advantages: string[];
  concerns: string[];
}

interface LineupDecision {
  position: 'FLEX' | 'WR2/3' | 'RB2' | 'TE' | 'DEF' | 'K';
  options: {
    player: string;
    recommendation: string;
    reasoning: string;
  }[];
  suggested_play: string;
}

interface FantasyMatchupData {
  matchup_id: string;
  week: number;
  team_a: TeamMatchup;
  team_b: TeamMatchup;
  key_storylines: string[];
  injury_watch: string[];
  waiver_implications: string[];
  stack_opportunities: StackOpportunity[];
}

interface StackOpportunity {
  type: 'QB_WR' | 'QB_TE' | 'RB_DEF';
  players: string[];
  correlation: number;
  upside: string;
  risk: string;
}

export default function FantasyMatchupPreview({ matchupData }: { matchupData: FantasyMatchupData }) {
  const [activeTeam, setActiveTeam] = useState<'team_a' | 'team_b'>('team_a');
  const [showAllPlayers, setShowAllPlayers] = useState(false);

  const getStartSitColor = (recommendation: string) => {
    switch (recommendation) {
      case 'MUST_START':
        return 'bg-green-600 text-white';
      case 'START':
        return 'bg-green-500 text-white';
      case 'FLEX':
        return 'bg-yellow-500 text-white';
      case 'BENCH':
        return 'bg-orange-500 text-white';
      case 'AVOID':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getMatchupGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFormTrend = (scores: number[]) => {
    if (scores.length < 2) return null;
    const recent = scores.slice(-2);
    return recent[1] > recent[0] ? 'up' : recent[1] < recent[0] ? 'down' : 'neutral';
  };

  const currentTeam = activeTeam === 'team_a' ? matchupData.team_a : matchupData.team_b;
  const opposingTeam = activeTeam === 'team_a' ? matchupData.team_b : matchupData.team_a;

  return (
    <div className="space-y-6">
      {/* Matchup Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-blue-600" />
              <span>Week {matchupData.week} Fantasy Matchup</span>
            </div>
            <div className="text-sm text-gray-600">
              Projected: {matchupData.team_a.projected_total.toFixed(1)} - {matchupData.team_b.projected_total.toFixed(1)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team A */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{matchupData.team_a.team_name}</h3>
                  <p className="text-sm text-gray-600">{matchupData.team_a.owner_name} • {matchupData.team_a.record}</p>
                </div>
                <Button
                  variant={activeTeam === 'team_a' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTeam('team_a')}
                >
                  Analyze
                </Button>
              </div>
              <div className="text-2xl font-bold text-center">
                {matchupData.team_a.projected_total.toFixed(1)}
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-600">Key Advantages:</div>
                {matchupData.team_a.advantages.slice(0, 2).map((advantage, index) => (
                  <div key={index} className="text-xs flex items-center space-x-1">
                    <ThumbsUp className="h-3 w-3 text-green-500" />
                    <span>{advantage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team B */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{matchupData.team_b.team_name}</h3>
                  <p className="text-sm text-gray-600">{matchupData.team_b.owner_name} • {matchupData.team_b.record}</p>
                </div>
                <Button
                  variant={activeTeam === 'team_b' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTeam('team_b')}
                >
                  Analyze
                </Button>
              </div>
              <div className="text-2xl font-bold text-center">
                {matchupData.team_b.projected_total.toFixed(1)}
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-600">Key Advantages:</div>
                {matchupData.team_b.advantages.slice(0, 2).map((advantage, index) => (
                  <div key={index} className="text-xs flex items-center space-x-1">
                    <ThumbsUp className="h-3 w-3 text-green-500" />
                    <span>{advantage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Fantasy Storylines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Key Fantasy Storylines</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {matchupData.key_storylines.map((storyline, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <Activity className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-900">{storyline}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Analysis */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>{currentTeam.team_name} - Player Analysis</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllPlayers(!showAllPlayers)}
                >
                  {showAllPlayers ? 'Show Key Players' : 'Show All Players'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentTeam.key_players
                  .filter(player => showAllPlayers || ['MUST_START', 'START', 'FLEX'].includes(player.start_sit))
                  .map((player, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-medium">{player.name}</h4>
                          <p className="text-sm text-gray-600">{player.position} • {player.team}</p>
                        </div>
                        {player.injury_status && player.injury_status !== 'healthy' && (
                          <Badge variant="destructive" className="text-xs">
                            {player.injury_status}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${getMatchupGradeColor(player.matchup_grade)}`}>
                          {player.matchup_grade} Matchup
                        </Badge>
                        <Badge className={`text-xs ${getStartSitColor(player.start_sit)}`}>
                          {player.start_sit.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-xs text-gray-600">Floor</div>
                        <div className="font-semibold">{player.floor.toFixed(1)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600">Projection</div>
                        <div className="font-semibold text-lg">{player.projected_points.toFixed(1)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600">Ceiling</div>
                        <div className="font-semibold">{player.ceiling.toFixed(1)}</div>
                      </div>
                    </div>

                    {/* Recent Form */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-600">Recent Form (Last 4):</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs">
                          {player.recent_form.map(score => score.toFixed(0)).join(' → ')}
                        </span>
                        {getFormTrend(player.recent_form) === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                        {getFormTrend(player.recent_form) === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                      </div>
                    </div>

                    {/* Key Factors */}
                    {player.key_factors.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">Key Factors:</div>
                        {player.key_factors.map((factor, factorIndex) => (
                          <div key={factorIndex} className="text-xs flex items-start space-x-2">
                            <Target className="h-3 w-3 text-blue-500 mt-0.5" />
                            <span>{factor}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lineup Decisions & Insights */}
        <div className="space-y-6">
          {/* Lineup Decisions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Lineup Decisions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentTeam.lineup_decisions.map((decision, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">{decision.position} Decision</h4>
                  <div className="space-y-2">
                    {decision.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.player}</span>
                          {option.player === decision.suggested_play && (
                            <Badge variant="default" className="text-xs">
                              Suggested
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1">{option.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Team Concerns */}
          {currentTeam.concerns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>Concerns</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentTeam.concerns.map((concern, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <ThumbsDown className="h-3 w-3 text-red-500 mt-0.5" />
                    <span>{concern}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Stack Opportunities */}
          {matchupData.stack_opportunities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  <span>Stack Opportunities</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {matchupData.stack_opportunities.map((stack, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{stack.type.replace('_', '/')} Stack</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(stack.correlation * 100)}% Correlation
                      </Badge>
                    </div>
                    <div className="text-xs space-y-1">
                      <div><strong>Players:</strong> {stack.players.join(' + ')}</div>
                      <div><strong>Upside:</strong> {stack.upside}</div>
                      <div><strong>Risk:</strong> {stack.risk}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Injury Watch & Waiver Implications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matchupData.injury_watch.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span>Injury Watch</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {matchupData.injury_watch.map((injury, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5" />
                  <span>{injury}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {matchupData.waiver_implications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Waiver Wire Impact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {matchupData.waiver_implications.map((implication, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <Star className="h-3 w-3 text-green-500 mt-0.5" />
                  <span>{implication}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
