'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp,
  TrendingDown,
  Crown,
  Target,
  Zap,
  AlertTriangle,
  BarChart3,
  Users,
  Trophy,
  ArrowRight,
  Calendar,
  Activity,
  Eye,
  Brain,
  Award,
  ChevronRight,
  Flame,
  Shield,
  Swords
} from 'lucide-react';

interface PlayerPerformance {
  name: string;
  position: string;
  projected: number;
  actual: number;
  variance_percentage: number;
  context: string;
  performance_tier: 'elite' | 'strong' | 'expected' | 'disappointing' | 'catastrophic';
  narrative_significance: string;
}

interface TeamAnalytics {
  efficiency_metrics: {
    projection_accuracy: number;
    consistency_score: number;
    ceiling_realization: number;
    floor_protection: number;
  };
  contextual_performance: {
    vs_expectation: number;
    roster_utilization: number;
    strategic_execution: number;
  };
}

interface SeasonNarrative {
  trajectory: 'ascending' | 'plateauing' | 'declining' | 'volatile';
  momentum_shift: boolean;
  power_ranking_movement: number;
  season_defining_moment: boolean;
  championship_implications: string;
}

interface PremiumRecapData {
  matchup_id: string;
  week: number;
  game_state: 'completed' | 'preview';
  
  // Premium Headline & Narrative
  headline: string;
  subheading: string;
  narrative_framework: 'upset_story' | 'dominant_performance' | 'back_and_forth_thriller' | 'statement_game' | 'season_defining';
  
  // Teams
  winner: {
    name: string;
    owner: string;
    score: number;
    projected_score: number;
    record: string;
    new_power_ranking: number;
    season_narrative: SeasonNarrative;
    team_analytics: TeamAnalytics;
    key_performers: PlayerPerformance[];
  };
  
  loser: {
    name: string;
    owner: string;
    score: number;
    projected_score: number;
    record: string;
    new_power_ranking: number;
    season_narrative: SeasonNarrative;
    team_analytics: TeamAnalytics;
    disappointing_performers: PlayerPerformance[];
  };
  
  // Advanced Analysis
  game_flow: {
    turning_points: Array<{
      player: string;
      moment: string;
      impact: string;
      swing_value: number;
    }>;
    momentum_shifts: number;
    lead_changes: number;
  };
  
  statistical_storylines: Array<{
    type: 'record_breaking' | 'historical_context' | 'trend_reversal' | 'statistical_anomaly';
    headline: string;
    data_point: string;
    significance: string;
    broader_implications: string;
  }>;
  
  expert_analysis: {
    key_tactical_decisions: string[];
    what_if_scenarios: Array<{
      scenario: string;
      impact: string;
    }>;
    season_implications: string[];
  };
  
  // Looking Ahead
  next_week_preview: {
    winner_opponent: string;
    winner_storyline: string;
    winner_win_probability: number;
    loser_opponent: string;
    loser_storyline: string;
    loser_win_probability: number;
  };
}

export default function PremiumMatchupRecap({ recapData }: { recapData: PremiumRecapData }) {
  const [activeSection, setActiveSection] = useState<'recap' | 'analysis' | 'implications'>('recap');

  const getPerformanceTierColor = (tier: string) => {
    switch (tier) {
      case 'elite':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'strong':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expected':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'disappointing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'catastrophic':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPerformanceTierIcon = (tier: string) => {
    switch (tier) {
      case 'elite':
        return <Crown className="h-3 w-3" />;
      case 'strong':
        return <TrendingUp className="h-3 w-3" />;
      case 'expected':
        return <Activity className="h-3 w-3" />;
      case 'disappointing':
        return <TrendingDown className="h-3 w-3" />;
      case 'catastrophic':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getTrajectoryIcon = (trajectory: string) => {
    switch (trajectory) {
      case 'ascending':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'volatile':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatTypeIcon = (type: string) => {
    switch (type) {
      case 'record_breaking':
        return <Trophy className="h-4 w-4 text-gold-500" />;
      case 'historical_context':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'trend_reversal':
        return <Target className="h-4 w-4 text-purple-500" />;
      case 'statistical_anomaly':
        return <Eye className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
        <CardHeader className="pb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-white/80">
                Week {recapData.week} • {recapData.game_state === 'preview' ? 'Game Preview' : 'Game Recap'}
              </Badge>
              {recapData.winner.season_narrative.season_defining_moment && (
                <Badge className="bg-gold-100 text-gold-800">
                  <Award className="h-3 w-3 mr-1" />
                  Season Defining
                </Badge>
              )}
            </div>
            
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-3">
                {recapData.headline}
              </CardTitle>
              <p className="text-xl text-gray-700 leading-relaxed">
                {recapData.subheading}
              </p>
            </div>
            
            {/* Score Display */}
            <div className="bg-white/80 rounded-xl p-6 border border-white/60">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Winner */}
                <div className="text-center">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      <h3 className="text-xl font-bold text-green-700">{recapData.winner.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{recapData.winner.owner}</p>
                    <div className="text-3xl font-bold text-green-600">{recapData.winner.score}</div>
                    <div className="text-sm text-gray-500">
                      Proj: {recapData.winner.projected_score} 
                      ({recapData.winner.score > recapData.winner.projected_score ? '+' : ''}{(recapData.winner.score - recapData.winner.projected_score).toFixed(1)})
                    </div>
                  </div>
                </div>
                
                {/* VS */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">VS</div>
                  <div className="text-sm text-gray-500 mt-2">
                    {recapData.game_state === 'preview' ? 'Projected Score' : 'Final Score'}
                  </div>
                </div>
                
                {/* Loser */}
                <div className="text-center">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-700">{recapData.loser.name}</h3>
                    <p className="text-sm text-gray-600">{recapData.loser.owner}</p>
                    <div className="text-3xl font-bold text-gray-600">{recapData.loser.score}</div>
                    <div className="text-sm text-gray-500">
                      Proj: {recapData.loser.projected_score} 
                      ({recapData.loser.score > recapData.loser.projected_score ? '+' : ''}{(recapData.loser.score - recapData.loser.projected_score).toFixed(1)})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'recap', label: recapData.game_state === 'preview' ? 'The Preview' : 'The Story', icon: Users },
            { id: 'analysis', label: 'Deep Analysis', icon: Brain },
            { id: 'implications', label: 'Season Impact', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeSection === id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content Sections */}
      {activeSection === 'recap' && (
        <div className="space-y-6">
          {/* Hero Performances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span>{recapData.game_state === 'preview' ? 'Projected Stars & Concerns' : 'Heroes & Villains'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Winners - Key Performers */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-700 flex items-center space-x-2">
                    <Crown className="h-4 w-4" />
                    <span>{recapData.winner.name} - Game Changers</span>
                  </h4>
                  <div className="space-y-3">
                    {recapData.winner.key_performers.map((player, index) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-green-900">{player.name}</span>
                              <Badge className={`text-xs ${getPerformanceTierColor(player.performance_tier)}`}>
                                {getPerformanceTierIcon(player.performance_tier)}
                                <span className="ml-1 capitalize">{player.performance_tier}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{player.position}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{player.actual}</div>
                            <div className="text-xs text-gray-500">
                              Proj: {player.projected} ({player.variance_percentage > 0 ? '+' : ''}{player.variance_percentage}%)
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-green-800 mb-2">{player.context}</p>
                        <p className="text-sm text-gray-700 italic">{player.narrative_significance}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Losers - Disappointing Performers */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-red-700 flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{recapData.loser.name} - The Letdowns</span>
                  </h4>
                  <div className="space-y-3">
                    {recapData.loser.disappointing_performers.map((player, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-red-900">{player.name}</span>
                              <Badge className={`text-xs ${getPerformanceTierColor(player.performance_tier)}`}>
                                {getPerformanceTierIcon(player.performance_tier)}
                                <span className="ml-1 capitalize">{player.performance_tier}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{player.position}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-red-600">{player.actual}</div>
                            <div className="text-xs text-gray-500">
                              Proj: {player.projected} ({player.variance_percentage > 0 ? '+' : ''}{player.variance_percentage}%)
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-red-800 mb-2">{player.context}</p>
                        <p className="text-sm text-gray-700 italic">{player.narrative_significance}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <span>How It Unfolded</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{recapData.game_flow.turning_points.length}</div>
                    <div className="text-sm text-blue-800">Turning Points</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{recapData.game_flow.momentum_shifts}</div>
                    <div className="text-sm text-purple-800">Momentum Shifts</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{recapData.game_flow.lead_changes}</div>
                    <div className="text-sm text-green-800">Lead Changes</div>
                  </div>
                </div>

                {/* Turning Points */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Critical Moments</h4>
                  {recapData.game_flow.turning_points.map((point, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900">{point.player}</span>
                          <Badge variant="outline" className="text-xs">
                            {point.swing_value > 0 ? '+' : ''}{point.swing_value} pts
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{point.moment}</p>
                        <p className="text-sm text-gray-600 italic">{point.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === 'analysis' && (
        <div className="space-y-6">
          {/* Statistical Storylines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <span>The Numbers Tell a Story</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recapData.statistical_storylines.map((storyline, index) => (
                  <div key={index} className="border-l-4 border-purple-500 bg-purple-50 p-6 rounded-r-lg">
                    <div className="flex items-start space-x-3">
                      {getStatTypeIcon(storyline.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-900 mb-2">{storyline.headline}</h4>
                        <div className="bg-white p-4 rounded border mb-3">
                          <div className="text-sm text-gray-600 mb-1">Key Statistic</div>
                          <div className="font-mono text-xl font-bold text-purple-600">{storyline.data_point}</div>
                        </div>
                        <p className="text-purple-800 mb-3">{storyline.significance}</p>
                        <p className="text-gray-700 text-sm italic">{storyline.broader_implications}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expert Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-indigo-500" />
                <span>Expert Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Key Tactical Decisions */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Key Tactical Decisions</h4>
                  <div className="space-y-2">
                    {recapData.expert_analysis.key_tactical_decisions.map((decision, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-indigo-50 border border-indigo-200 rounded">
                        <Target className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-indigo-900">{decision}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What-If Scenarios */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">What-If Scenarios</h4>
                  <div className="space-y-3">
                    {recapData.expert_analysis.what_if_scenarios.map((scenario, index) => (
                      <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h5 className="font-medium text-yellow-900 mb-2">{scenario.scenario}</h5>
                        <p className="text-sm text-yellow-800">{scenario.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === 'implications' && (
        <div className="space-y-6">
          {/* Season Trajectories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Season Trajectories</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Winner Analysis */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Crown className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold text-green-700">{recapData.winner.name}</h4>
                    <div className="flex items-center space-x-1">
                      {getTrajectoryIcon(recapData.winner.season_narrative.trajectory)}
                      <span className="text-sm capitalize">{recapData.winner.season_narrative.trajectory}</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Record</div>
                        <div className="font-semibold">{recapData.winner.record}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Power Ranking</div>
                        <div className="font-semibold">#{recapData.winner.new_power_ranking}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Championship Implications</div>
                      <p className="text-sm text-green-800">{recapData.winner.season_narrative.championship_implications}</p>
                    </div>
                  </div>
                </div>

                {/* Loser Analysis */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-500" />
                    <h4 className="font-semibold text-gray-700">{recapData.loser.name}</h4>
                    <div className="flex items-center space-x-1">
                      {getTrajectoryIcon(recapData.loser.season_narrative.trajectory)}
                      <span className="text-sm capitalize">{recapData.loser.season_narrative.trajectory}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Record</div>
                        <div className="font-semibold">{recapData.loser.record}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Power Ranking</div>
                        <div className="font-semibold">#{recapData.loser.new_power_ranking}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Championship Implications</div>
                      <p className="text-sm text-gray-700">{recapData.loser.season_narrative.championship_implications}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Looking Ahead */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span>Week {recapData.week + 1} Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Winner's Next Game */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-green-700">{recapData.winner.name}</h4>
                    <Badge className="bg-green-100 text-green-800">
                      {recapData.next_week_preview.winner_win_probability}% Win Probability
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Swords className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="font-medium">vs {recapData.next_week_preview.winner_opponent}</div>
                      <p className="text-sm text-green-700 mt-1">{recapData.next_week_preview.winner_storyline}</p>
                    </div>
                  </div>
                  
                  <Progress value={recapData.next_week_preview.winner_win_probability} className="w-full" />
                </div>

                {/* Loser's Next Game */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-700">{recapData.loser.name}</h4>
                    <Badge className="bg-gray-100 text-gray-800">
                      {recapData.next_week_preview.loser_win_probability}% Win Probability
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <Swords className="h-8 w-8 text-gray-600" />
                    <div>
                      <div className="font-medium">vs {recapData.next_week_preview.loser_opponent}</div>
                      <p className="text-sm text-gray-700 mt-1">{recapData.next_week_preview.loser_storyline}</p>
                    </div>
                  </div>
                  
                  <Progress value={recapData.next_week_preview.loser_win_probability} className="w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Season Implications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Season Implications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recapData.expert_analysis.season_implications.map((implication, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <ChevronRight className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-900">{implication}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
