import Link from "next/link"
import { ArrowLeft, Users, Trophy, TrendingUp, Calendar, Target } from "lucide-react"

export const revalidate = 60

const SLEEPER = "https://api.sleeper.app/v1"
const LEAGUE_ID = process.env.LEAGUE_ID || "1180507846524702720"

type SleeperUser = { user_id: string; display_name: string; metadata?: Record<string, any> }
type SleeperRoster = { roster_id: number; owner_id: string | null; metadata?: Record<string, any>; settings: { wins: number; losses: number; ties: number; fpts: number; fpts_against: number } }

type TeamProfile = {
  rosterId: number
  teamName: string
  ownerName: string
  record: { wins: number; losses: number; ties: number }
  stats: {
    pointsFor: number
    pointsAgainst: number
    pointsDiff: number
    avgPointsFor: number
    avgPointsAgainst: number
    winPercentage: number
  }
  ranking: {
    position: number
    trend: 'up' | 'down' | 'same'
  }
  status: 'playoff' | 'bubble' | 'eliminated'
}

async function sx(path: string) { 
  const r = await fetch(`${SLEEPER}${path}`, { next: { revalidate } })
  if (!r.ok) throw new Error(`Sleeper fetch failed: ${path}`)
  return r.json() 
}

async function getUsers(leagueId: string): Promise<SleeperUser[]> { return sx(`/league/${leagueId}/users`) }
async function getRosters(leagueId: string): Promise<SleeperRoster[]> { return sx(`/league/${leagueId}/rosters`) }

function buildTeamProfiles(rosters: SleeperRoster[], users: SleeperUser[]): TeamProfile[] {
  const userById = new Map(users.map(u => [u.user_id, u]))

  const teams = rosters.map(roster => {
    const user = roster.owner_id ? userById.get(roster.owner_id) : undefined
    const teamName = roster.metadata?.team_name || user?.metadata?.team_name || user?.display_name || `Team ${roster.roster_id}`
    const ownerName = user?.display_name || "Unknown Owner"
    
    const totalGames = roster.settings.wins + roster.settings.losses + (roster.settings.ties || 0)
    const winPercentage = totalGames > 0 ? roster.settings.wins / totalGames : 0
    const pointsDiff = (roster.settings.fpts || 0) - (roster.settings.fpts_against || 0)
    
    return {
      rosterId: roster.roster_id,
      teamName,
      ownerName,
      record: {
        wins: roster.settings.wins,
        losses: roster.settings.losses,
        ties: roster.settings.ties || 0
      },
      stats: {
        pointsFor: roster.settings.fpts || 0,
        pointsAgainst: roster.settings.fpts_against || 0,
        pointsDiff,
        avgPointsFor: totalGames > 0 ? (roster.settings.fpts || 0) / totalGames : 0,
        avgPointsAgainst: totalGames > 0 ? (roster.settings.fpts_against || 0) / totalGames : 0,
        winPercentage
      },
      ranking: {
        position: 0, // Will be set after sorting
        trend: 'same' as const // Placeholder - would need historical data
      },
      status: 'bubble' as const // Will be determined after ranking
    }
  })

  // Sort by wins first, then by points for
  teams.sort((a, b) => {
    if (a.record.wins !== b.record.wins) return b.record.wins - a.record.wins
    return b.stats.pointsFor - a.stats.pointsFor
  })

  // Assign rankings and status
  teams.forEach((team, index) => {
    team.ranking.position = index + 1
    const totalTeams = teams.length
    const playoffSpots = Math.min(6, Math.ceil(totalTeams / 2))
    
    if (team.ranking.position <= playoffSpots) {
      team.status = 'playoff'
    } else if (team.ranking.position <= playoffSpots + 2) {
      team.status = 'bubble'
    } else {
      team.status = 'eliminated'
    }
  })

  return teams
}

function TeamCard({ team }: { team: TeamProfile }) {
  const statusConfig = {
    playoff: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'Playoffs' },
    bubble: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: 'On Bubble' },
    eliminated: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Eliminated' }
  }
  
  const config = statusConfig[team.status]

  return (
    <div className={`${config.bg} ${config.border} border rounded-2xl p-6 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white font-bold text-lg">
            {team.teamName.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{team.teamName}</h3>
            <p className="text-sm text-gray-600">{team.ownerName}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-extrabold text-gray-900">#{team.ranking.position}</span>
            {team.ranking.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
            {team.ranking.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />}
          </div>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${config.text} bg-white`}>
            {config.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Record</div>
          <div className="text-lg font-bold text-gray-900">
            {team.record.wins}-{team.record.losses}
            {team.record.ties > 0 && `-${team.record.ties}`}
          </div>
          <div className="text-sm text-gray-600">
            {(team.stats.winPercentage * 100).toFixed(1)}% win rate
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Points For</div>
          <div className="text-lg font-bold text-gray-900">{team.stats.pointsFor.toFixed(1)}</div>
          <div className="text-sm text-gray-600">{team.stats.avgPointsFor.toFixed(1)} avg</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Points Against</div>
          <div className="text-lg font-bold text-gray-900">{team.stats.pointsAgainst.toFixed(1)}</div>
          <div className="text-sm text-gray-600">{team.stats.avgPointsAgainst.toFixed(1)} avg</div>
        </div>
        
        <div className="bg-white rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Point Differential</div>
          <div className={`text-lg font-bold ${team.stats.pointsDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {team.stats.pointsDiff >= 0 ? '+' : ''}{team.stats.pointsDiff.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">
            {team.stats.pointsDiff >= 0 ? 'Favorable' : 'Deficit'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/50">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            <span>Rank {team.ranking.position}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>{team.stats.avgPointsFor.toFixed(1)} PPG</span>
          </div>
        </div>
        
        <Link 
          href={`/teams/${team.rosterId}`}
          className="text-blue-700 font-semibold hover:underline text-sm"
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}

function LeagueOverview({ teams }: { teams: TeamProfile[] }) {
  const totalTeams = teams.length
  const playoffTeams = teams.filter(t => t.status === 'playoff').length
  const bubbleTeams = teams.filter(t => t.status === 'bubble').length
  const eliminatedTeams = teams.filter(t => t.status === 'eliminated').length
  
  const avgPointsFor = teams.reduce((sum, team) => sum + team.stats.pointsFor, 0) / totalTeams
  const topScorer = teams.reduce((top, team) => team.stats.pointsFor > top.stats.pointsFor ? team : top)
  const mostWins = teams.reduce((top, team) => team.record.wins > top.record.wins ? team : top)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-2xl border p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalTeams}</div>
            <div className="text-sm text-gray-600">Total Teams</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{playoffTeams}</div>
            <div className="text-sm text-gray-600">In Playoffs</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{avgPointsFor.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Avg Points</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Target className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{mostWins.record.wins}</div>
            <div className="text-sm text-gray-600">Most Wins</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function TeamsPage() {
  try {
    const [users, rosters] = await Promise.all([
      getUsers(LEAGUE_ID).catch(() => []),
      getRosters(LEAGUE_ID).catch(() => [])
    ])

    const teams = buildTeamProfiles(rosters, users)

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
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-orange-700 text-white">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Teams</h1>
                <p className="text-gray-600 mt-1">League roster breakdown and team profiles</p>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-8">
          <LeagueOverview teams={teams} />

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <TeamCard key={team.rosterId} team={team} />
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 bg-white rounded-2xl border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">League Leaders</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Most Wins</h4>
                <div className="space-y-2">
                  {teams.slice(0, 3).map((team, index) => (
                    <div key={team.rosterId} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{index + 1}. {team.teamName}</span>
                      <span className="text-sm font-semibold text-gray-600">{team.record.wins}-{team.record.losses}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Highest Scoring</h4>
                <div className="space-y-2">
                  {[...teams].sort((a, b) => b.stats.pointsFor - a.stats.pointsFor).slice(0, 3).map((team, index) => (
                    <div key={team.rosterId} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{index + 1}. {team.teamName}</span>
                      <span className="text-sm font-semibold text-gray-600">{team.stats.pointsFor.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Best Defense</h4>
                <div className="space-y-2">
                  {[...teams].sort((a, b) => a.stats.pointsAgainst - b.stats.pointsAgainst).slice(0, 3).map((team, index) => (
                    <div key={team.rosterId} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{index + 1}. {team.teamName}</span>
                      <span className="text-sm font-semibold text-gray-600">{team.stats.pointsAgainst.toFixed(1)} PA</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-8 bg-white rounded-2xl border p-6">
            <h3 className="font-bold text-gray-900 mb-4">Explore More</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/standings" className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                View Standings
              </Link>
              <Link href="/scores" className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                Latest Scores
              </Link>
              <Link href="/matchups/this-week" className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                This Week's Matchups
              </Link>
              <Link href="/odds" className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
                Playoff Odds
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading teams:', error)
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to load teams</h1>
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
