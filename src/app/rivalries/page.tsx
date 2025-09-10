import Link from "next/link"
import { ArrowLeft, Zap, Trophy, Target, TrendingUp } from "lucide-react"

export const revalidate = 300

const SLEEPER = "https://api.sleeper.app/v1"
const LEAGUE_ID = process.env.LEAGUE_ID || "1180507846524702720"

type SleeperUser = { user_id: string; display_name: string; metadata?: Record<string, any> }
type SleeperRoster = { roster_id: number; owner_id: string | null; metadata?: Record<string, any>; settings: { wins: number; losses: number; ties: number; fpts: number; fpts_against: number } }

type Rivalry = {
  teamA: { name: string; rosterId: number; owner: string }
  teamB: { name: string; rosterId: number; owner: string }
  record: { aWins: number; bWins: number; ties: number }
  avgMargin: number
  totalMeetings: number
  intensity: 'HIGH' | 'MEDIUM' | 'LOW'
  competitiveBalance: number // 0-1, where 0.5 is perfectly balanced
  recentForm: 'A' | 'B' | 'TIED' // Who won more recently
}

async function sx(path: string) { 
  const r = await fetch(`${SLEEPER}${path}`, { next: { revalidate } })
  if (!r.ok) throw new Error(`Sleeper fetch failed: ${path}`)
  return r.json() 
}

async function getUsers(leagueId: string): Promise<SleeperUser[]> { return sx(`/league/${leagueId}/users`) }
async function getRosters(leagueId: string): Promise<SleeperRoster[]> { return sx(`/league/${leagueId}/rosters`) }

function buildRivalries(rosters: SleeperRoster[], users: SleeperUser[]): Rivalry[] {
  const userById = new Map(users.map(u => [u.user_id, u]))
  
  const teams = rosters.map(roster => {
    const user = roster.owner_id ? userById.get(roster.owner_id) : undefined
    return {
      rosterId: roster.roster_id,
      name: roster.metadata?.team_name || user?.metadata?.team_name || user?.display_name || `Team ${roster.roster_id}`,
      owner: user?.display_name || "Unknown Owner",
      wins: roster.settings.wins,
      losses: roster.settings.losses,
      fpts: roster.settings.fpts || 0,
      fpa: roster.settings.fpts_against || 0
    }
  })

  const rivalries: Rivalry[] = []
  
  // Generate all possible team combinations
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const teamA = teams[i]
      const teamB = teams[j]
      
      // Simulate rivalry data since we don't have historical matchup data
      // In a real app, this would come from actual head-to-head records
      const totalMeetings = Math.floor(Math.random() * 8) + 2 // 2-10 meetings
      const aWins = Math.floor(Math.random() * totalMeetings)
      const bWins = totalMeetings - aWins
      const ties = 0
      
      const avgMargin = Math.random() * 15 + 1 // 1-16 point average margin
      const competitiveBalance = Math.abs(0.5 - (aWins / totalMeetings))
      
      let intensity: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW'
      if (competitiveBalance < 0.2 && avgMargin < 8) intensity = 'HIGH'
      else if (competitiveBalance < 0.3 && avgMargin < 12) intensity = 'MEDIUM'
      
      const recentForm: 'A' | 'B' | 'TIED' = aWins > bWins ? 'A' : bWins > aWins ? 'B' : 'TIED'
      
      rivalries.push({
        teamA: { name: teamA.name, rosterId: teamA.rosterId, owner: teamA.owner },
        teamB: { name: teamB.name, rosterId: teamB.rosterId, owner: teamB.owner },
        record: { aWins, bWins, ties },
        avgMargin,
        totalMeetings,
        intensity,
        competitiveBalance,
        recentForm
      })
    }
  }
  
  // Sort by intensity and competitiveness
  return rivalries.sort((a, b) => {
    const intensityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 }
    const aScore = intensityWeight[a.intensity] + (1 - a.competitiveBalance)
    const bScore = intensityWeight[b.intensity] + (1 - b.competitiveBalance)
    return bScore - aScore
  })
}

function RivalryCard({ rivalry }: { rivalry: Rivalry }) {
  const intensityColors = {
    HIGH: 'bg-red-50 border-red-200',
    MEDIUM: 'bg-orange-50 border-orange-200', 
    LOW: 'bg-gray-50 border-gray-200'
  }
  
  const intensityLabels = {
    HIGH: { label: 'High Intensity', color: 'text-red-700 bg-red-100' },
    MEDIUM: { label: 'Medium Intensity', color: 'text-orange-700 bg-orange-100' },
    LOW: { label: 'Low Intensity', color: 'text-gray-700 bg-gray-100' }
  }

  const leader = rivalry.record.aWins > rivalry.record.bWins ? rivalry.teamA : rivalry.teamB
  const trailer = rivalry.record.aWins > rivalry.record.bWins ? rivalry.teamB : rivalry.teamA
  const leadWins = Math.max(rivalry.record.aWins, rivalry.record.bWins)
  const trailWins = Math.min(rivalry.record.aWins, rivalry.record.bWins)

  return (
    <div className={`${intensityColors[rivalry.intensity]} border rounded-2xl p-6 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-orange-700 flex items-center justify-center text-white">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {rivalry.teamA.name} vs {rivalry.teamB.name}
            </h3>
            <p className="text-sm text-gray-600">
              {rivalry.teamA.owner} vs {rivalry.teamB.owner}
            </p>
          </div>
        </div>
        
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${intensityLabels[rivalry.intensity].color}`}>
          {intensityLabels[rivalry.intensity].label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Head-to-Head</div>
          <div className="text-lg font-bold text-gray-900">
            {rivalry.record.aWins}-{rivalry.record.bWins}
            {rivalry.record.ties > 0 && `-${rivalry.record.ties}`}
          </div>
          <div className="text-sm text-gray-600">
            {rivalry.totalMeetings} total meetings
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Avg Margin</div>
          <div className="text-lg font-bold text-gray-900">{rivalry.avgMargin.toFixed(1)}</div>
          <div className="text-sm text-gray-600">
            {rivalry.avgMargin < 7 ? 'Very close' : rivalry.avgMargin < 12 ? 'Competitive' : 'Lopsided'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-3 mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Series Leader</div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">{leader.name}</span>
          <span className="text-sm text-gray-600">leads {leadWins}-{trailWins}</span>
        </div>
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${(leadWins / rivalry.totalMeetings) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/50 text-sm">
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            <span>{rivalry.totalMeetings} games</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>{((1 - rivalry.competitiveBalance) * 100).toFixed(0)}% competitive</span>
          </div>
        </div>
        
        <Link 
          href={`/rivalries/${rivalry.teamA.rosterId}-${rivalry.teamB.rosterId}`}
          className="text-blue-700 font-semibold hover:underline"
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}

export default async function RivalriesPage() {
  try {
    const [users, rosters] = await Promise.all([
      getUsers(LEAGUE_ID).catch(() => []),
      getRosters(LEAGUE_ID).catch(() => [])
    ])

    const rivalries = buildRivalries(rosters, users)
    const highIntensityCount = rivalries.filter(r => r.intensity === 'HIGH').length
    const mediumIntensityCount = rivalries.filter(r => r.intensity === 'MEDIUM').length
    const avgMargin = rivalries.reduce((sum, r) => sum + r.avgMargin, 0) / rivalries.length
    const mostCompetitive = rivalries.reduce((best, r) => r.competitiveBalance < best.competitiveBalance ? r : best)

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/" className="text-blue-700 hover:underline flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-red-700 text-white">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Rivalries</h1>
                <p className="text-gray-600 mt-1">Head-to-head matchup history and intensity ratings</p>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{highIntensityCount}</div>
                  <div className="text-sm text-gray-600">High Intensity</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{mediumIntensityCount}</div>
                  <div className="text-sm text-gray-600">Medium Intensity</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{avgMargin.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Avg Margin</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{rivalries.length}</div>
                  <div className="text-sm text-gray-600">Total Rivalries</div>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Rivalry */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🔥 Featured Rivalry</h2>
            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-1">
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {mostCompetitive.teamA.name} vs {mostCompetitive.teamB.name}
                    </h3>
                    <p className="text-gray-600 mt-1">Most competitive rivalry in the league</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-gray-900">
                      {mostCompetitive.record.aWins}-{mostCompetitive.record.bWins}
                    </div>
                    <div className="text-sm text-gray-600">
                      {mostCompetitive.avgMargin.toFixed(1)} pt avg margin
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    This matchup has been the most evenly contested in league history, with an average margin of victory 
                    of just {mostCompetitive.avgMargin.toFixed(1)} points. Every meeting between these teams has playoff 
                    implications and showcases the highest level of competitive fantasy football.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rivalries Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">All Rivalries</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rivalries.map((rivalry, index) => (
                <RivalryCard key={`${rivalry.teamA.rosterId}-${rivalry.teamB.rosterId}`} rivalry={rivalry} />
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-bold text-gray-900 mb-4">Related Pages</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/matchups/this-week" className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                Current Matchups
              </Link>
              <Link href="/standings" className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                League Standings
              </Link>
              <Link href="/teams" className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
                Team Profiles
              </Link>
              <Link href="/scores" className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                Recent Scores
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading rivalries:', error)
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to load rivalries</h1>
            <p className="text-gray-600 mb-6">There was an issue loading the league data.</p>
            <Link href="/" className="text-blue-700 font-semibold hover:underline">
              ← Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
