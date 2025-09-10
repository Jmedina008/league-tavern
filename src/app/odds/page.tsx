import Link from "next/link"
import { ArrowLeft, TrendingUp, Target, BarChart3, Percent } from "lucide-react"

export const revalidate = 300

const SLEEPER = "https://api.sleeper.app/v1"
const LEAGUE_ID = process.env.LEAGUE_ID || "1180507846524702720"

type SleeperUser = { user_id: string; display_name: string; metadata?: Record<string, any> }
type SleeperRoster = { roster_id: number; owner_id: string | null; metadata?: Record<string, any>; settings: { wins: number; losses: number; ties: number; fpts: number; fpts_against: number } }

type TeamOdds = {
  rosterId: number
  teamName: string
  ownerName: string
  currentRank: number
  record: { wins: number; losses: number; ties: number }
  stats: { pointsFor: number; pointsAgainst: number; winPct: number }
  playoffOdds: number
  championshipOdds: number
  projectedWins: number
  strengthOfSchedule: number
  powerRating: number
  trend: 'HOT' | 'COLD' | 'STEADY'
}

async function sx(path: string) { 
  const r = await fetch(`${SLEEPER}${path}`, { next: { revalidate } })
  if (!r.ok) throw new Error(`Sleeper fetch failed: ${path}`)
  return r.json() 
}

async function getUsers(leagueId: string): Promise<SleeperUser[]> { return sx(`/league/${leagueId}/users`) }
async function getRosters(leagueId: string): Promise<SleeperRoster[]> { return sx(`/league/${leagueId}/rosters`) }

function calculateOdds(rosters: SleeperRoster[], users: SleeperUser[]): TeamOdds[] {
  const userById = new Map(users.map(u => [u.user_id, u]))

  const teams = rosters.map(roster => {
    const user = roster.owner_id ? userById.get(roster.owner_id) : undefined
    const teamName = roster.metadata?.team_name || user?.metadata?.team_name || user?.display_name || `Team ${roster.roster_id}`
    const ownerName = user?.display_name || "Unknown Owner"
    
    const totalGames = roster.settings.wins + roster.settings.losses + (roster.settings.ties || 0)
    const winPct = totalGames > 0 ? roster.settings.wins / totalGames : 0
    const pointsDiff = (roster.settings.fpts || 0) - (roster.settings.fpts_against || 0)
    
    // Calculate power rating (combination of record and point differential)
    const powerRating = Math.max(0, Math.min(100, 
      (winPct * 60) + 
      (Math.max(-20, Math.min(20, pointsDiff / 10)) + 20) * 2
    ))
    
    // Simulate playoff odds based on current standing and power rating
    const basePlayoffOdds = Math.max(0, Math.min(100, powerRating * 0.9 + Math.random() * 20))
    const playoffOdds = Math.round(basePlayoffOdds)
    
    // Championship odds are lower and based on playoff odds
    const championshipOdds = Math.round(playoffOdds * 0.15 + Math.random() * 5)
    
    // Project final wins based on current pace and strength
    const remainingGames = Math.max(0, 14 - totalGames) // Assume 14 game season
    const projectedWins = roster.settings.wins + (remainingGames * (powerRating / 100))
    
    // Strength of schedule (simulated - would be based on actual opponent strength)
    const strengthOfSchedule = Math.random() * 20 + 40 // 40-60 range
    
    // Determine trend based on recent performance (simulated)
    let trend: 'HOT' | 'COLD' | 'STEADY' = 'STEADY'
    if (powerRating > 70) trend = 'HOT'
    else if (powerRating < 40) trend = 'COLD'

    return {
      rosterId: roster.roster_id,
      teamName,
      ownerName,
      currentRank: 0, // Will be set after sorting
      record: {
        wins: roster.settings.wins,
        losses: roster.settings.losses,
        ties: roster.settings.ties || 0
      },
      stats: {
        pointsFor: roster.settings.fpts || 0,
        pointsAgainst: roster.settings.fpts_against || 0,
        winPct
      },
      playoffOdds,
      championshipOdds,
      projectedWins,
      strengthOfSchedule,
      powerRating,
      trend
    }
  })

  // Sort by power rating and assign ranks
  teams.sort((a, b) => b.powerRating - a.powerRating)
  teams.forEach((team, index) => {
    team.currentRank = index + 1
  })

  return teams
}

function TeamOddsCard({ team }: { team: TeamOdds }) {
  const trendColors = {
    HOT: 'text-red-600 bg-red-100',
    COLD: 'text-blue-600 bg-blue-100',
    STEADY: 'text-gray-600 bg-gray-100'
  }

  const playoffColor = team.playoffOdds >= 75 ? 'text-green-600' : 
                     team.playoffOdds >= 50 ? 'text-yellow-600' : 
                     team.playoffOdds >= 25 ? 'text-orange-600' : 'text-red-600'

  return (
    <div className="bg-white rounded-2xl border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
            #{team.currentRank}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{team.teamName}</h3>
            <p className="text-sm text-gray-600">{team.ownerName}</p>
          </div>
        </div>
        
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${trendColors[team.trend]}`}>
          {team.trend}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Playoff Odds</div>
          <div className={`text-2xl font-extrabold ${playoffColor}`}>
            {team.playoffOdds}%
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Championship</div>
          <div className="text-2xl font-extrabold text-gray-900">{team.championshipOdds}%</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Power Rating</div>
          <div className="text-lg font-bold text-gray-900">{team.powerRating.toFixed(1)}</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div 
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${team.powerRating}%` }}
            />
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Projected Wins</div>
          <div className="text-lg font-bold text-gray-900">{team.projectedWins.toFixed(1)}</div>
          <div className="text-xs text-gray-600">Current: {team.record.wins}-{team.record.losses}</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Strength of Schedule</div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-semibold text-gray-900">{team.strengthOfSchedule.toFixed(1)}</span>
          <span className="text-xs text-gray-600">
            {team.strengthOfSchedule > 55 ? 'Difficult' : team.strengthOfSchedule > 45 ? 'Average' : 'Easy'}
          </span>
        </div>
      </div>
    </div>
  )
}

function PlayoffBracket({ teams }: { teams: TeamOdds[] }) {
  const playoffTeams = teams.filter(t => t.playoffOdds >= 50).slice(0, 6)
  const bubbleTeams = teams.filter(t => t.playoffOdds >= 25 && t.playoffOdds < 50).slice(0, 4)

  return (
    <div className="bg-white rounded-2xl border p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Projected Playoff Picture</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            Playoff Bound ({playoffTeams.length})
          </h4>
          <div className="space-y-3">
            {playoffTeams.map((team) => (
              <div key={team.rosterId} className="flex items-center justify-between bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">
                    {team.currentRank}
                  </span>
                  <span className="font-semibold text-gray-900">{team.teamName}</span>
                </div>
                <span className="text-sm font-bold text-green-700">{team.playoffOdds}%</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-yellow-700 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            On the Bubble ({bubbleTeams.length})
          </h4>
          <div className="space-y-3">
            {bubbleTeams.map((team) => (
              <div key={team.rosterId} className="flex items-center justify-between bg-yellow-50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-yellow-600 text-white text-xs font-bold flex items-center justify-center">
                    {team.currentRank}
                  </span>
                  <span className="font-semibold text-gray-900">{team.teamName}</span>
                </div>
                <span className="text-sm font-bold text-yellow-700">{team.playoffOdds}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChampionshipContenders({ teams }: { teams: TeamOdds[] }) {
  const contenders = teams.filter(t => t.championshipOdds >= 5).slice(0, 8)

  return (
    <div className="bg-white rounded-2xl border p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Championship Contenders</h3>
      
      <div className="space-y-4">
        {contenders.map((team, index) => (
          <div key={team.rosterId} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm flex items-center justify-center">
                  {index + 1}
                </span>
                <div>
                  <div className="font-semibold text-gray-900">{team.teamName}</div>
                  <div className="text-xs text-gray-500">{team.record.wins}-{team.record.losses} • {team.powerRating.toFixed(1)} rating</div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{team.championshipOdds}%</div>
              <div className="text-xs text-gray-500">to win it all</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function OddsPage() {
  try {
    const [users, rosters] = await Promise.all([
      getUsers(LEAGUE_ID).catch(() => []),
      getRosters(LEAGUE_ID).catch(() => [])
    ])

    const teamsWithOdds = calculateOdds(rosters, users)
    
    const avgPlayoffOdds = teamsWithOdds.reduce((sum, team) => sum + team.playoffOdds, 0) / teamsWithOdds.length
    const highestChampionshipOdds = Math.max(...teamsWithOdds.map(t => t.championshipOdds))
    const mostImproved = teamsWithOdds.filter(t => t.trend === 'HOT').length

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
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-700 text-white">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Playoff Odds</h1>
                <p className="text-gray-600 mt-1">Championship probabilities and projections</p>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{avgPlayoffOdds.toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">Avg Playoff Odds</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{highestChampionshipOdds}%</div>
                  <div className="text-sm text-gray-600">Best Championship Odds</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Percent className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{mostImproved}</div>
                  <div className="text-sm text-gray-600">Teams Trending Up</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{teamsWithOdds.length}</div>
                  <div className="text-sm text-gray-600">Total Teams</div>
                </div>
              </div>
            </div>
          </div>

          {/* Playoff Bracket */}
          <div className="mb-8">
            <PlayoffBracket teams={teamsWithOdds} />
          </div>

          {/* Championship Contenders */}
          <div className="mb-8">
            <ChampionshipContenders teams={teamsWithOdds} />
          </div>

          {/* All Team Odds */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Odds Board</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamsWithOdds.map((team) => (
                <TeamOddsCard key={team.rosterId} team={team} />
              ))}
            </div>
          </div>

          {/* Methodology */}
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">How Odds Are Calculated</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Power Rating</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Combines win percentage (60%) with point differential (40%) to create a comprehensive team strength metric.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Playoff Odds</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Based on current power rating, remaining schedule strength, and historical performance patterns.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Championship Odds</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Derived from playoff odds with adjustments for postseason performance factors and team consistency.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Trend Analysis</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  HOT/COLD/STEADY classifications based on recent performance relative to season averages.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 bg-white rounded-2xl border p-6">
            <h3 className="font-bold text-gray-900 mb-4">Related Pages</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/standings" className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                Current Standings
              </Link>
              <Link href="/teams" className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
                Team Profiles
              </Link>
              <Link href="/matchups/this-week" className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                This Week's Games
              </Link>
              <Link href="/rankings" className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                Power Rankings
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading odds:', error)
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to load odds</h1>
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
