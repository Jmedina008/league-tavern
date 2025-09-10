import Link from "next/link"
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Crown, Target, BarChart3 } from "lucide-react"
import { mockContent } from "@/lib/content"

export default function RankingsPage() {
  const rankings = mockContent.rankings.sort((a, b) => a.rank - b.rank)

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S': return 'bg-purple-600'
      case 'A': return 'bg-blue-600'
      case 'B': return 'bg-green-600'
      case 'C': return 'bg-orange-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-blue-700 font-semibold hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <h1 className="text-3xl font-extrabold">Power Rankings</h1>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-xl font-extrabold mb-2">Week 1 Power Rankings</h2>
          <p className="text-gray-600 text-sm">
            Our comprehensive team rankings based on performance, consistency, and playoff potential.
          </p>
        </div>

        <div className="divide-y">
          {rankings.map((ranking) => (
            <div key={ranking.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-gray-800">#{ranking.rank}</span>
                    {getTrendIcon(ranking.trend as 'up' | 'down' | 'stable')}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold">{ranking.teamName}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BarChart3 className="h-3 w-3" />
                      <span>{ranking.record}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span className={`${getTierColor(ranking.tier)} text-white text-xs font-black px-2 py-0.5 rounded`}>
                        Tier {ranking.tier}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Previous: #{ranking.previousRank}</div>
                  <div className="text-xs text-gray-400">
                    {ranking.trend === 'up' ? '↗️ Climbing' : ranking.trend === 'down' ? '↘️ Falling' : '→ Stable'}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-700 leading-relaxed">
                {ranking.analysis}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">Tier S</span>
          </div>
          <p className="text-xs text-purple-700">Elite teams with championship potential</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">Tier A</span>
          </div>
          <p className="text-xs text-blue-700">Strong contenders for playoff spots</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-green-800">Tier B</span>
          </div>
          <p className="text-xs text-green-700">Solid teams with upside potential</p>
        </div>
      </div>
    </div>
  )
}
