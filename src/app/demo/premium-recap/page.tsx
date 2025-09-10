import PremiumMatchupRecap from '@/components/matchup/PremiumMatchupRecap';
import { treyVeonVsSpicyBijanRecap, basicVsPremium } from '@/data/treyveon-vs-spicy-bijan-recap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Zap, 
  TrendingUp,
  BarChart3,
  Eye,
  Brain,
  Trophy
} from 'lucide-react';

export default function PremiumRecapDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-gold-500" />
              <h1 className="text-3xl font-bold text-gray-900">
                Premium Matchup Recap Demo
              </h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Live Example
              </Badge>
            </div>
            <p className="text-lg text-gray-600 max-w-4xl">
              Experience the transformation from basic fantasy recaps to premium sports journalism. 
              This example showcases how we elevate CBS-style content to rival the best sports analysis platforms.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Comparison Section */}
        <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-yellow-600" />
              <span>The Transformation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Approach */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-gray-100 text-gray-600">
                    Basic Recap (CBS Style)
                  </Badge>
                </div>
                <div className="bg-gray-100 p-6 rounded-lg border">
                  <h3 className="font-medium text-gray-900 mb-3">
                    {basicVsPremium.basic_approach.headline}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {basicVsPremium.basic_approach.summary}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  ❌ Surface-level player mentions<br/>
                  ❌ No strategic context<br/>
                  ❌ Missing game flow analysis<br/>
                  ❌ No season implications
                </div>
              </div>

              {/* Premium Approach */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    Premium Recap (Our Approach)
                  </Badge>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3">
                    {basicVsPremium.premium_approach.headline}
                  </h3>
                  <p className="text-blue-800 text-sm leading-relaxed mb-4">
                    {basicVsPremium.premium_approach.analysis_depth}
                  </p>
                  <div className="text-xs text-blue-700 italic">
                    {basicVsPremium.premium_approach.narrative_sophistication}
                  </div>
                </div>
                <div className="text-sm text-green-700">
                  ✅ Roster construction philosophy<br/>
                  ✅ Game flow with turning points<br/>
                  ✅ Statistical storylines & context<br/>
                  ✅ Expert tactical analysis<br/>
                  ✅ Season-long implications
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>Key Premium Differentiators</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {basicVsPremium.key_differentiators.map((differentiator, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-white rounded border">
                    <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{differentiator}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation to Premium Content */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 text-gray-600">
            <div className="h-px bg-gray-300 flex-1"></div>
            <div className="flex items-center space-x-2 px-4">
              <ArrowRight className="h-5 w-5" />
              <span className="font-medium">Premium Analysis Below</span>
              <ArrowRight className="h-5 w-5" />
            </div>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>
        </div>

        {/* Premium Recap Component */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6">
            <PremiumMatchupRecap recapData={treyVeonVsSpicyBijanRecap} />
          </div>
        </div>

        {/* Feature Highlights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span>What Makes This Premium</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Brain className="h-4 w-4 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Strategic Analysis</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Deep dive into roster construction philosophies, tactical decisions, and strategic implications that basic recaps miss entirely.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Predictive Framework</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Forward-looking analysis with next week previews, season trajectories, and championship implications rather than just backward-looking summaries.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Statistical Storytelling</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Advanced metrics woven into compelling narratives, with historical context and broader implications that elevate beyond basic stat recaps.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-3">The Result</h4>
              <p className="text-indigo-800 leading-relaxed">
                A premium fantasy football analysis experience that rivals ESPN, The Athletic, and other top-tier sports journalism platforms. 
                Instead of basic player performance summaries, readers get expert-level insights, strategic context, and predictive analysis 
                that genuinely helps them understand the deeper dynamics of fantasy football success.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
