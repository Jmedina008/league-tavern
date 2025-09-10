'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  History, 
  Zap,
  AlertTriangle,
  Trophy,
  Clock,
  BarChart3
} from 'lucide-react';

interface MatchupData {
  matchupId: string;
  week: number;
  teamA: TeamInfo;
  teamB: TeamInfo;
  historical: HistoricalData;
  intelligence: IntelligenceData;
}

interface TeamInfo {
  id: string;
  name: string;
  owner: string;
  record: string;
  points_for: number;
  points_against: number;
  recent_form: number[]; // Last 4 weeks scores
  projection: number;
  confidence_interval: [number, number];
}

interface HistoricalData {
  head_to_head: {
    wins: number;
    losses: number;
    average_margin: number;
    last_meeting: {
      week: number;
      score: [number, number];
      margin: number;
    };
  };
  patterns: {
    teamA_as_favorite: { record: string; avg_margin: number };
    teamB_as_underdog: { record: string; upset_rate: number };
    close_games: number; // Games decided by <10 points
  };
}

interface IntelligenceData {
  storylines: Storyline[];
  key_factors: KeyFactor[];
  prediction_confidence: number;
  x_factors: XFactor[];
  scenario_modeling: ScenarioModel[];
}

interface Storyline {
  type: 'revenge' | 'rivalry' | 'momentum' | 'narrative';
  title: string;
  description: string;
  relevance_score: number;
}

interface KeyFactor {
  factor: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  statistical_backing: string;
}

interface XFactor {
  player_position: string;
  impact_description: string;
  probability: number;
}

interface ScenarioModel {
  scenario: string;
  probability: number;
  projected_outcome: string;
  line_movement: number;
}

export default function AdvancedMatchupPreview({ matchupData }: { matchupData: MatchupData }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'intelligence' | 'scenarios'>('overview');
  const [predictionAccuracy, setPredictionAccuracy] = useState<number>(0);

  useEffect(() => {
    // Simulate fetching historical prediction accuracy
    setPredictionAccuracy(Math.round(65 + Math.random() * 20)); // 65-85% range
  }, []);

  const { teamA, teamB, historical, intelligence } = matchupData;
  const spread = Math.abs(teamA.projection - teamB.projection);
  const favorite = teamA.projection > teamB.projection ? teamA : teamB;
  const underdog = teamA.projection > teamB.projection ? teamB : teamA;

  const getFormTrend = (scores: number[]) => {
    if (scores.length < 2) return 'neutral';
    const recent = scores.slice(-2);
    return recent[1] > recent[0] ? 'up' : recent[1] < recent[0] ? 'down' : 'neutral';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 65) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Intelligence Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <span>Advanced Matchup Intelligence</span>
            </CardTitle>
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getConfidenceColor(intelligence.prediction_confidence)}`}>
                {intelligence.prediction_confidence}% Confidence
              </div>
              <Badge variant="outline" className="text-xs">
                Historical Accuracy: {predictionAccuracy}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Team A Analysis */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{teamA.name}</h3>
                <div className="flex items-center space-x-2">
                  {getFormTrend(teamA.recent_form) === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {getFormTrend(teamA.recent_form) === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                  <span className="text-sm text-gray-600">{teamA.record}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Projection:</span>
                  <span className="font-medium">{teamA.projection} ±{Math.round((teamA.confidence_interval[1] - teamA.confidence_interval[0]) / 2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Recent Form:</span>
                  <span className="font-mono text-xs">
                    {teamA.recent_form.slice(-4).map(score => score.toFixed(0)).join(' → ')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Season Avg:</span>
                  <span>{(teamA.points_for / teamA.recent_form.length).toFixed(1)} PPG</span>
                </div>
              </div>
            </div>

            {/* Matchup Center */}
            <div className="text-center space-y-3">
              <div className="text-2xl font-bold">VS</div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  {favorite.name} favored by {spread.toFixed(1)}
                </div>
                <div className="text-lg font-semibold">
                  {teamA.projection.toFixed(1)} - {teamB.projection.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">
                  Total: {(teamA.projection + teamB.projection).toFixed(1)}
                </div>
              </div>
              {historical.head_to_head.wins + historical.head_to_head.losses > 0 && (
                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-600">Historical</div>
                  <div className="text-sm font-medium">
                    {teamA.name} leads {historical.head_to_head.wins}-{historical.head_to_head.losses}
                  </div>
                </div>
              )}
            </div>

            {/* Team B Analysis */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{teamB.name}</h3>
                <div className="flex items-center space-x-2">
                  {getFormTrend(teamB.recent_form) === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {getFormTrend(teamB.recent_form) === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                  <span className="text-sm text-gray-600">{teamB.record}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Projection:</span>
                  <span className="font-medium">{teamB.projection} ±{Math.round((teamB.confidence_interval[1] - teamB.confidence_interval[0]) / 2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Recent Form:</span>
                  <span className="font-mono text-xs">
                    {teamB.recent_form.slice(-4).map(score => score.toFixed(0)).join(' → ')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Season Avg:</span>
                  <span>{(teamB.points_for / teamB.recent_form.length).toFixed(1)} PPG</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Intelligence Overview', icon: BarChart3 },
            { id: 'intelligence', label: 'Deep Analysis', icon: Brain },
            { id: 'scenarios', label: 'Scenario Modeling', icon: Target }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Storylines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>Key Storylines</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {intelligence.storylines.map((storyline, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{storyline.title}</h4>
                      <Badge 
                        variant={storyline.relevance_score > 0.7 ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {storyline.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{storyline.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Key Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Critical Factors</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {intelligence.key_factors.map((factor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{factor.factor}</span>
                      <Badge 
                        variant={factor.impact === 'high' ? 'destructive' : factor.impact === 'medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {factor.impact} impact
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{factor.description}</p>
                    <p className="text-xs text-blue-600 font-mono">{factor.statistical_backing}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'intelligence' && (
          <div className="space-y-6">
            {/* X-Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>X-Factor Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {intelligence.x_factors.map((xfactor, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{xfactor.player_position}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {Math.round(xfactor.probability * 100)}% chance
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{xfactor.impact_description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Historical Context */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Historical Context</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Head-to-Head Record</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>All-time:</span>
                        <span>{teamA.name} {historical.head_to_head.wins}-{historical.head_to_head.losses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg. margin:</span>
                        <span>{historical.head_to_head.average_margin.toFixed(1)} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Close games:</span>
                        <span>{historical.patterns.close_games} (decided by <10)</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Last Meeting</h4>
                    {historical.head_to_head.last_meeting && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Week {historical.head_to_head.last_meeting.week}:</span>
                          <span>
                            {historical.head_to_head.last_meeting.score[0]}-{historical.head_to_head.last_meeting.score[1]}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Margin:</span>
                          <span>{historical.head_to_head.last_meeting.margin} pts</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Scenario Modeling</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {intelligence.scenario_modeling.map((scenario, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{scenario.scenario}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(scenario.probability * 100)}% likely
                        </Badge>
                        {scenario.line_movement !== 0 && (
                          <Badge variant={scenario.line_movement > 0 ? 'default' : 'secondary'} className="text-xs">
                            Line {scenario.line_movement > 0 ? '+' : ''}{scenario.line_movement}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{scenario.projected_outcome}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
