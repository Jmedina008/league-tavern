import Link from "next/link"
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react"

export const revalidate = 60

const SLEEPER = "https://api.sleeper.app/v1"
const LEAGUE_ID = process.env.LEAGUE_ID || "1180507846524702720"

type SleeperUser = { user_id: string; display_name: string; metadata?: Record<string, any> }
type SleeperRoster = { roster_id: number; owner_id: string | null; metadata?: Record<string, any>; settings: { wins: number; losses: number; ties: number; fpts: number; fpts_against: number } }

type StandingsTeam = {
  rank: number
  teamName: string
  ownerName: string
  rosterId: number
  wins: number
  losses: number
  ties: number
  pointsFor: number
  pointsAgainst: number
  pointsDiff: number
  winPct: number
  avgPointsFor: number
  avgPointsAgainst: number
}

async function sx(path: string) { 
  const r = await fetch(`${SLEEPER}${path}`, { next: { revalidate } })
  if (!r.ok) throw new Error(`Sleeper fetch failed: ${path}`)
  return r.json() 
}

async function getUsers(leagueId: string): Promise<SleeperUser[]> { return sx(`/league/${leagueId}/users`) }
async function getRosters(leagueId: string): Promise<SleeperRoster[]> { return sx(`/league/${leagueId}/rosters`) }

function buildStandings(rosters: SleeperRoster[], users: SleeperUser[]): StandingsTeam[] {
  const userById = new Map(users.map(u => [u.user_id, u]))

  const teams = rosters.map(roster => {
    const user = roster.owner_id ? userById.get(roster.owner_id) : undefined
    const teamName = roster.metadata?.team_name || user?.metadata?.team_name || user?.display_name || `Team ${roster.roster_id}`
    const ownerName = user?.display_name || "Unknown Owner"
    
    const totalGames = roster.settings.wins + roster.settings.losses + (roster.settings.ties || 0)
    const winPct = totalGames > 0 ? roster.settings.wins / totalGames : 0
    const pointsDiff = (roster.settings.fpts || 0) - (roster.settings.fpts_against || 0)
    
    return {
      rank: 0, // Will be set after sorting
      teamName,
      ownerName,
      rosterId: roster.roster_id,
      wins: roster.settings.wins,
      losses: roster.settings.losses,
      ties: roster.settings.ties || 0,
      pointsFor: roster.settings.fpts || 0,
      pointsAgainst: roster.settings.fpts_against || 0,
      pointsDiff,
      winPct,
      avgPointsFor: totalGames > 0 ? (roster.settings.fpts || 0) / totalGames : 0,
      avgPointsAgainst: totalGames > 0 ? (roster.settings.fpts_against || 0) / totalGames : 0
    }
  })

  // Sort by wins first, then by points for
  teams.sort((a, b) => {
    if (a.wins !== b.wins) return b.wins - a.wins
    return b.pointsFor - a.pointsFor
  })

  // Assign ranks
  teams.forEach((team, index) => {
    team.rank = index + 1
  })

  return teams
}

function getRankBadge(rank: number) {
  if (rank === 1) return { icon: Trophy, color: "text-yellow-600 bg-yellow-100", label: "1st" }
  if (rank <= 4) return { icon: TrendingUp, color: "text-green-600 bg-green-100", label: `${rank}${rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'}` }
  if (rank <= 8) return { icon: Minus, color: "text-gray-600 bg-gray-100", label: `${rank}th` }
  return { icon: TrendingDown, color: "text-red-600 bg-red-100", label: `${rank}th` }
}

function PlayoffIndicator({ rank, totalTeams }: { rank: number; totalTeams: number }) {
  const playoffSpots = Math.min(6, Math.ceil(totalTeams / 2)) // Usually 6 teams make playoffs
  
  if (rank <= playoffSpots) {
    return (
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="text-xs font-medium text-green-700">Playoffs</span>
      </div>
    )
  }
  
  if (rank <= playoffSpots + 2) {
    return (
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
        <span className="text-xs font-medium text-yellow-700">Bubble</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 rounded-full bg-red-500"></div>
      <span className="text-xs font-medium text-red-700">Eliminated</span>
    </div>
  )
}

export default async function StandingsPage() {
  try {
    const [users, rosters] = await Promise.all([
      getUsers(LEAGUE_ID).catch(() => []),
      getRosters(LEAGUE_ID).catch(() => [])
    ])

    const standings = buildStandings(rosters, users)
    const totalTeams = standings.length

    // Calculate league averages
    const avgPointsFor = standings.reduce((sum, team) => sum + team.pointsFor, 0) / totalTeams
    const avgPointsAgainst = standings.reduce((sum, team) => sum + team.pointsAgainst, 0) / totalTeams
    const highestScore = Math.max(...standings.map(t => t.pointsFor))
    const lowestScore = Math.min(...standings.map(t => t.pointsFor))

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
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-purple-700 text-white">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Standings</h1>
                <p className="text-gray-600 mt-1">Current league rankings and playoff picture</p>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-8">
          {/* League Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border p-4">
              <div className="text-2xl font-bold text-gray-900">{totalTeams}</div>
              <div className="text-sm text-gray-600">Teams</div>
            </div>
            <div className="bg-white rounded-2xl border p-4">
              <div className="text-2xl font-bold text-gray-900">{avgPointsFor.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Avg PF</div>
            </div>
            <div className="bg-white rounded-2xl border p-4">
              <div className="text-2xl font-bold text-gray-900">{highestScore.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Highest PF</div>
            </div>
            <div className="bg-white rounded-2xl border p-4">
              <div className="text-2xl font-bold text-gray-900">{lowestScore.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Lowest PF</div>
            </div>
          </div>

          {/* Standings Table */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Current Standings</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-left">
                    <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Team</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Record</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Win %</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">PF</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">PA</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Diff</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {standings.map((team) => {
                    const badge = getRankBadge(team.rank)
                    const Icon = badge.icon
                    
                    return (
                      <tr key={team.rosterId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${badge.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-gray-900">{team.rank}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900">{team.teamName}</div>
                            <div className="text-sm text-gray-500">{team.ownerName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {team.wins}-{team.losses}
                            {team.ties > 0 && `-${team.ties}`}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {(team.winPct * 100).toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{team.pointsFor.toFixed(1)}</div>
                          <div className="text-xs text-gray-500">{team.avgPointsFor.toFixed(1)} avg</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{team.pointsAgainst.toFixed(1)}</div>
                          <div className="text-xs text-gray-500">{team.avgPointsAgainst.toFixed(1)} avg</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`font-medium ${team.pointsDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {team.pointsDiff >= 0 ? '+' : ''}{team.pointsDiff.toFixed(1)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <PlayoffIndicator rank={team.rank} totalTeams={totalTeams} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Playoff Picture */}
          <div className="mt-8 bg-white rounded-2xl border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Playoff Picture</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  Clinched
                </h4>
                <div className="space-y-1 text-sm">
                  {standings.filter(t => t.rank <= Math.min(4, Math.ceil(totalTeams / 3))).map(team => (
                    <div key={team.rosterId} className="text-gray-700">{team.rank}. {team.teamName}</div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  In Contention
                </h4>
                <div className="space-y-1 text-sm">
                  {standings.filter(t => t.rank > Math.min(4, Math.ceil(totalTeams / 3)) && t.rank <= Math.min(8, Math.ceil(totalTeams * 0.75))).map(team => (
                    <div key={team.rosterId} className="text-gray-700">{team.rank}. {team.teamName}</div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  Eliminated
                </h4>
                <div className="space-y-1 text-sm">
                  {standings.filter(t => t.rank > Math.min(8, Math.ceil(totalTeams * 0.75))).map(team => (
                    <div key={team.rosterId} className="text-gray-700">{team.rank}. {team.teamName}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 bg-white rounded-2xl border p-6">
            <h3 className="font-bold text-gray-900 mb-4">Related Pages</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/scores" className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                View Scores
              </Link>
              <Link href="/matchups/this-week" className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                This Week's Matchups
              </Link>
              <Link href="/odds" className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                Playoff Odds
              </Link>
              <Link href="/teams" className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
                Team Pages
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading standings:', error)
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to load standings</h1>
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
