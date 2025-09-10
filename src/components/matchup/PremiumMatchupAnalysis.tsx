'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Lightbulb,
  Target,
  Zap,
  AlertTriangle,
  Clock,
  Activity,
  Brain,
  Search
} from 'lucide-react';

interface StatisticalInsight {
  type: 'hidden_pattern' | 'counterintuitive' | 'predictive' | 'anomaly';
  headline: string;
  data_point: string;
  insight: string;
  implication: string;
  confidence_level: 'high' | 'medium' | 'low';
}

interface NarrativeArc {
  framework: 'detective_story' | 'david_vs_goliath' | 'historical_parallel' | 'statistical_anomaly' | 'season_arc';
  title: string;
  setup: string;
  tension: string;
  resolution_preview: string;
}

interface AdvancedMetric {
  name: string;
  team_a_value: number;
  team_b_value: number;
  league_average: number;
  significance: string;
  trend_direction: 'up' | 'down' | 'stable';
}

interface PremiumMatchupData {
  matchup_id: string;
  week: number;
  headline: string;
  subtitle: string;
  
  teams: {
    team_a: {
      name: string;
      owner: string;
      record: string;
      surface_stats: { points_avg: number; record: string; trend: string };
      efficiency_profile: { 
        red_zone_attempts: number;
        red_zone_conversion: number;
        scoring_variance: number;
        clutch_performance: number;
      };
    };
    team_b: {
      name: string;
      owner: string;
      record: string;
      surface_stats: { points_avg: number; record: string; trend: string };
      efficiency_profile: { 
        red_zone_attempts: number;
        red_zone_conversion: number;
        scoring_variance: number;
        clutch_performance: number;
      };
    };
  };
  
  statistical_insights: StatisticalInsight[];
  narrative_arc: NarrativeArc;
  advanced_metrics: AdvancedMetric[];
  key_collision_points: string[];
  prediction_framework: {
    primary_thesis: string;
    supporting_data: string[];
    watch_points: string[];
    upset_indicators: string[];
  };
}

export default function PremiumMatchupAnalysis({ matchupData }: { matchupData: PremiumMatchupData }) {
  const [activeSection, setActiveSection] = useState<'analysis' | 'insights' | 'prediction'>('analysis');

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'hidden_pattern':
        return <Search className="h-4 w-4" />;
      case 'counterintuitive':
        return <Eye className="h-4 w-4" />;
      case 'predictive':
        return <TrendingUp className="h-4 w-4" />;
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'hidden_pattern':
        return 'border-l-blue-500 bg-blue-50';
      case 'counterintuitive':
        return 'border-l-purple-500 bg-purple-50';
      case 'predictive':
        return 'border-l-green-500 bg-green-50';
      case 'anomaly':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getConfidenceBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge className="bg-green-100 text-green-800">High Confidence</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Confidence</Badge>;
      case 'low':
        return <Badge className="bg-red-100 text-red-800">Low Confidence</Badge>;
      default:
        return null;
    }
  };

  const getMetricTrend = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {matchupData.headline}
              </CardTitle>
              <p className="text-lg text-gray-700 max-w-4xl">
                {matchupData.subtitle}
              </p>
            </div>
            <Badge variant="outline" className="bg-white/80">
              Week {matchupData.week} • Premium Analysis
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Team A Profile */}
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="text-xl font-semibold">{matchupData.teams.team_a.name}</h3>
                <p className="text-sm text-gray-600">
                  {matchupData.teams.team_a.owner} • {matchupData.teams.team_a.record}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Scoring Average</div>
                  <div className="font-semibold text-lg">
                    {matchupData.teams.team_a.surface_stats.points_avg}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Recent Form</div>
                  <div className="font-semibold">
                    {matchupData.teams.team_a.surface_stats.trend}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">RZ Conversion</div>
                  <div className="font-semibold">
                    {matchupData.teams.team_a.efficiency_profile.red_zone_conversion}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Variance (σ)</div>
                  <div className="font-semibold">
                    {matchupData.teams.team_a.efficiency_profile.scoring_variance}
                  </div>
                </div>
              </div>
            </div>

            {/* Team B Profile */}
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="text-xl font-semibold">{matchupData.teams.team_b.name}</h3>
                <p className="text-sm text-gray-600">
                  {matchupData.teams.team_b.owner} • {matchupData.teams.team_b.record}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Scoring Average</div>
                  <div className="font-semibold text-lg">
                    {matchupData.teams.team_b.surface_stats.points_avg}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Recent Form</div>
                  <div className="font-semibold">
                    {matchupData.teams.team_b.surface_stats.trend}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">RZ Conversion</div>
                  <div className="font-semibold">
                    {matchupData.teams.team_b.efficiency_profile.red_zone_conversion}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Variance (σ)</div>
                  <div className="font-semibold">
                    {matchupData.teams.team_b.efficiency_profile.scoring_variance}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'analysis', label: 'The Deep Dive', icon: Brain },
            { id: 'insights', label: 'Statistical Insights', icon: BarChart3 },
            { id: 'prediction', label: 'The Call', icon: Target }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeSection === id
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

      {/* Content Sections */}
      {activeSection === 'analysis' && (
        <div className="space-y-6">
          {/* Narrative Arc */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>{matchupData.narrative_arc.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">The Setup</h4>
                  <p className="text-gray-700 leading-relaxed">{matchupData.narrative_arc.setup}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">The Tension</h4>
                  <p className="text-gray-700 leading-relaxed">{matchupData.narrative_arc.tension}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">What to Watch</h4>
                  <p className="text-gray-700 leading-relaxed">{matchupData.narrative_arc.resolution_preview}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Collision Points */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Key Collision Points</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {matchupData.key_collision_points.map((point, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Target className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-900">{point}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Advanced Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2">Metric</th>
                      <th className="text-center py-2">{matchupData.teams.team_a.name}</th>
                      <th className="text-center py-2">{matchupData.teams.team_b.name}</th>
                      <th className="text-center py-2">League Avg</th>
                      <th className="text-center py-2">Trend</th>
                      <th className="text-left py-2">Significance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {matchupData.advanced_metrics.map((metric, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 font-medium">{metric.name}</td>
                        <td className="text-center py-3 font-mono">{metric.team_a_value}</td>
                        <td className="text-center py-3 font-mono">{metric.team_b_value}</td>
                        <td className="text-center py-3 font-mono text-gray-500">{metric.league_average}</td>
                        <td className="text-center py-3">{getMetricTrend(metric.trend_direction)}</td>
                        <td className="py-3 text-gray-600">{metric.significance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === 'insights' && (
        <div className="space-y-6">
          {matchupData.statistical_insights.map((insight, index) => (
            <Card key={index} className={`border-l-4 ${getInsightColor(insight.type)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    {getInsightIcon(insight.type)}
                    <span>{insight.headline}</span>
                  </CardTitle>
                  {getConfidenceBadge(insight.confidence_level)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600 mb-1">Key Data Point</div>
                  <div className="font-mono text-lg font-semibold text-blue-600">
                    {insight.data_point}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-2">The Insight</div>
                  <p className="text-gray-900 leading-relaxed">{insight.insight}</p>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-2">What This Means</div>
                  <p className="text-gray-700 leading-relaxed">{insight.implication}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeSection === 'prediction' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <span>The Call</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-semibold text-green-900 mb-3">Primary Thesis</h4>
              <p className="text-green-800 leading-relaxed text-lg">
                {matchupData.prediction_framework.primary_thesis}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Supporting Data</span>
                </h4>
                <div className="space-y-2">
                  {matchupData.prediction_framework.supporting_data.map((data, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <span>{data}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Upset Indicators</span>
                </h4>
                <div className="space-y-2">
                  {matchupData.prediction_framework.upset_indicators.map((indicator, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                      <span>{indicator}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Watch Points</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matchupData.prediction_framework.watch_points.map((point, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded p-3">
                    <p className="text-sm text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
