import Link from "next/link"
import { ArrowLeft, Trophy, TrendingUp, Calendar, RotateCcw } from "lucide-react"

export const revalidate = 60

const SLEEPER = "https://api.sleeper.app/v1"
const LEAGUE_ID = process.env.LEAGUE_ID || "1180507846524702720"

type SleeperUser = { user_id: string; display_name: string; metadata?: Record<string, any> }
type SleeperRoster = { roster_id: number; owner_id: string | null; metadata?: Record<string, any>; settings: { wins: number; losses: number; ties: number; fpts: number; fpts_against: number } }
type SleeperMatchup = { roster_id: number; matchup_id: number; points: number }

type ScoreboardGame = {
  matchupId: number
  teamA: { name: string; rosterId: number; score: number; owner: string }
  teamB: { name: string; rosterId: number; score: number; owner: string }
  status: 'LIVE' | 'FINAL' | 'UPCOMING'
  margin: number
}

async function sx(path: string) { 
  const r = await fetch(`${SLEEPER}${path}`, { next: { revalidate } })
  if (!r.ok) throw new Error(`Sleeper fetch failed: ${path}`)
  return r.json() 
}

async function getState() { return sx(`/state/nfl`) }
async function getUsers(leagueId: string): Promise<SleeperUser[]> { return sx(`/league/${leagueId}/users`) }
async function getRosters(leagueId: string): Promise<SleeperRoster[]> { return sx(`/league/${leagueId}/rosters`) }
async function getMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> { return sx(`/league/${leagueId}/matchups/${week}`) }

function buildScoreboard(matchups: SleeperMatchup[], rosters: SleeperRoster[], users: SleeperUser[], week: number): ScoreboardGame[] {
  const byId = new Map<number, SleeperMatchup[]>()
  for (const m of matchups) { 
    const arr = byId.get(m.matchup_id) || []
    arr.push(m)
    byId.set(m.matchup_id, arr) 
  }

  const userById = new Map(users.map(u => [u.user_id, u]))
  const rosterById = new Map(rosters.map(r => [r.roster_id, r]))

  const games: ScoreboardGame[] = []
  
  for (const [mid, arr] of byId) {
    if (arr.length < 2) continue
    const [m1, m2] = arr
    const r1 = rosterById.get(m1.roster_id)
    const r2 = rosterById.get(m2.roster_id)
    if (!r1 || !r2) continue

    const u1 = r1.owner_id ? userById.get(r1.owner_id) : undefined
    const u2 = r2.owner_id ? userById.get(r2.owner_id) : undefined
    
    const teamName = (r: SleeperRoster, u?: SleeperUser) => 
      r.metadata?.team_name || u?.metadata?.team_name || u?.display_name || `Team ${r.roster_id}`

    const teamA = {
      name: teamName(r1, u1),
      rosterId: r1.roster_id,
      score: Math.round((m1.points || 0) * 10) / 10,
      owner: u1?.display_name || "Unknown"
    }

    const teamB = {
      name: teamName(r2, u2),
      rosterId: r2.roster_id,
      score: Math.round((m2.points || 0) * 10) / 10,
      owner: u2?.display_name || "Unknown"
    }

    const margin = Math.abs(teamA.score - teamB.score)
    const hasScoring = teamA.score > 0 || teamB.score > 0
    
    games.push({
      matchupId: mid,
      teamA,
      teamB,
      status: hasScoring ? 'FINAL' : 'UPCOMING',
      margin
    })
  }

  return games.sort((a, b) => b.margin - a.margin) // Sort by closest games first
}

function WeekSelector({ currentWeek, selectedWeek }: { currentWeek: number; selectedWeek: number }) {
  const weeks = Array.from({ length: Math.min(18, currentWeek + 2) }, (_, i) => i + 1)
  
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">Week:</span>
      {weeks.map(week => (
        <Link 
          key={week}
          href={`/scores?week=${week}`}
          className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
            week === selectedWeek 
              ? 'bg-blue-700 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {week}
        </Link>
      ))}
    </div>
  )
}

function GameCard({ game }: { game: ScoreboardGame }) {
  const winner = game.teamA.score > game.teamB.score ? game.teamA : game.teamB
  const loser = game.teamA.score > game.teamB.score ? game.teamB : game.teamA
  const isTie = game.teamA.score === game.teamB.score && game.teamA.score > 0

  return (
    <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
            game.status === 'FINAL' ? 'bg-gray-700 text-white' :
            game.status === 'LIVE' ? 'bg-red-600 text-white' : 
            'bg-blue-100 text-blue-800'
          }`}>
            {game.status}
          </span>
          {game.status === 'FINAL' && game.margin < 5 && (
            <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded">
              CLOSE GAME
            </span>
          )}
        </div>

        <div className="space-y-3">
          {/* Team A */}
          <div className={`flex items-center justify-between p-3 rounded-lg ${
            game.teamA.score > game.teamB.score && game.status === 'FINAL' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-gray-50'
          }`}>
            <div className="flex-1">
              <div className="font-bold text-gray-900">{game.teamA.name}</div>
              <div className="text-sm text-gray-500">{game.teamA.owner}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-gray-900">
                {game.teamA.score.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Team B */}
          <div className={`flex items-center justify-between p-3 rounded-lg ${
            game.teamB.score > game.teamA.score && game.status === 'FINAL' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-gray-50'
          }`}>
            <div className="flex-1">
              <div className="font-bold text-gray-900">{game.teamB.name}</div>
              <div className="text-sm text-gray-500">{game.teamB.owner}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-gray-900">
                {game.teamB.score.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {game.status === 'FINAL' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {isTie ? 'Tie game' : `${winner.name} wins by ${game.margin.toFixed(1)}`}
              </span>
              <Link 
                href={`/matchups/${game.matchupId}`}
                className="text-blue-700 font-semibold hover:underline"
              >
                View Details →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default async function ScoresPage({ searchParams }: { searchParams?: Promise<{ week?: string }> }) {
  try {
    const params = searchParams ? await searchParams : {}
    const state = await getState().catch(() => ({ week: 1 }))
    const currentWeek = Number(state?.week || 1)
    const selectedWeek = params?.week ? Number(params.week) : currentWeek

    const [users, rosters, matchups] = await Promise.all([
      getUsers(LEAGUE_ID).catch(() => []),
      getRosters(LEAGUE_ID).catch(() => []),
      getMatchups(LEAGUE_ID, selectedWeek).catch(() => [])
    ])

    const games = buildScoreboard(matchups, rosters, users, selectedWeek)
    const totalPoints = games.reduce((sum, game) => sum + game.teamA.score + game.teamB.score, 0)
    const highestScoring = games.length > 0 ? Math.max(...games.map(g => Math.max(g.teamA.score, g.teamB.score))) : 0
    const closestGame = games.length > 0 ? Math.min(...games.map(g => g.margin)) : 0

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

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-green-700 text-white">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900">Scores</h1>
                  <p className="text-gray-600 mt-1">Week {selectedWeek} results and standings</p>
                </div>
              </div>

              <WeekSelector currentWeek={currentWeek} selectedWeek={selectedWeek} />
            </div>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{highestScoring.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Highest Score</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalPoints.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <RotateCcw className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{closestGame.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Closest Margin</div>
                </div>
              </div>
            </div>
          </div>

          {/* Games Grid */}
          {games.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {games.map((game) => (
                <GameCard key={game.matchupId} game={game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No games yet</h3>
              <p className="text-gray-600">Scores will appear here once matchups are available for Week {selectedWeek}.</p>
            </div>
          )}
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading scores:', error)
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to load scores</h1>
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
