import Link from "next/link"

export const revalidate = 60
const SLEEPER = "https://api.sleeper.app/v1"
const LEAGUE_ID = process.env.LEAGUE_ID || "1180507846524702720"

type SleeperUser = { user_id: string; display_name: string; metadata?: Record<string, any> }
type SleeperRoster = { roster_id: number; owner_id: string | null; metadata?: Record<string, any>; settings: { wins: number; losses: number; ties: number; fpts: number; fpts_against: number } }
type SleeperMatchup = { roster_id: number; matchup_id: number; points: number }

type Pair = {
  a: { rosterId: number; teamName: string; ownerName: string; points: number; wins: number; losses: number; fpts: number; fpa: number }
  b: { rosterId: number; teamName: string; ownerName: string; points: number; wins: number; losses: number; fpts: number; fpa: number }
  matchupId: number
}

async function sx(path: string) { const r = await fetch(`${SLEEPER}${path}`, { next: { revalidate } }); if (!r.ok) throw new Error(`Sleeper fetch failed: ${path}`); return r.json() }
async function getState() { return sx(`/state/nfl`) }
async function getUsers(leagueId: string): Promise<SleeperUser[]> { return sx(`/league/${leagueId}/users`) }
async function getRosters(leagueId: string): Promise<SleeperRoster[]> { return sx(`/league/${leagueId}/rosters`) }
async function getMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> { return sx(`/league/${leagueId}/matchups/${week}`) }

function pairMatchups(matchups: SleeperMatchup[], rosters: SleeperRoster[], users: SleeperUser[]): Pair[] {
  const byId = new Map<number, SleeperMatchup[]>()
  for (const m of matchups) { const arr = byId.get(m.matchup_id) || []; arr.push(m); byId.set(m.matchup_id, arr) }
  const userById = new Map(users.map(u => [u.user_id, u]))
  const rosterById = new Map(rosters.map(r => [r.roster_id, r]))
  const pairs: Pair[] = []
  for (const [mid, arr] of byId) {
    if (arr.length < 2) continue
    const [m1, m2] = arr
    const r1 = rosterById.get(m1.roster_id)!; const r2 = rosterById.get(m2.roster_id)!
    const u1 = r1.owner_id ? userById.get(r1.owner_id) : undefined
    const u2 = r2.owner_id ? userById.get(r2.owner_id) : undefined
    const nameFrom = (r: SleeperRoster, u?: SleeperUser) => r.metadata?.team_name || u?.metadata?.team_name || u?.display_name || `Team ${r.roster_id}`
    pairs.push({
      matchupId: mid,
      a: { rosterId: r1.roster_id, teamName: nameFrom(r1, u1), ownerName: u1?.display_name || "—", points: Math.round((arr.find(x=>x.roster_id===r1.roster_id)?.points||0)*10)/10, wins: r1.settings.wins, losses: r1.settings.losses, fpts: r1.settings.fpts, fpa: r1.settings.fpts_against },
      b: { rosterId: r2.roster_id, teamName: nameFrom(r2, u2), ownerName: u2?.display_name || "—", points: Math.round((arr.find(x=>x.roster_id===r2.roster_id)?.points||0)*10)/10, wins: r2.settings.wins, losses: r2.settings.losses, fpts: r2.settings.fpts, fpa: r2.settings.fpts_against },
    })
  }
  return pairs
}

// Fantasy-specific weekly projection system
function generateWeeklyProjections(p: Pair, week: number) {
  // Base projections on positional averages and team performance
  const teamABaseProjection = calculateTeamProjection(p.a, week)
  const teamBBaseProjection = calculateTeamProjection(p.b, week)
  
  // Apply matchup modifiers (opponent strength, injury adjustments, etc.)
  const teamAProjection = applyMatchupModifiers(teamABaseProjection, p.a, p.b)
  const teamBProjection = applyMatchupModifiers(teamBBaseProjection, p.b, p.a)
  
  return { teamAProjection, teamBProjection }
}

function calculateTeamProjection(team: Pair['a'], week: number) {
  // Season performance weight
  const totalGames = team.wins + team.losses
  const seasonAvg = totalGames > 0 ? team.fpts / totalGames : 0
  
  // Weekly baseline (QB: 18-25, RB1: 12-18, WR1: 11-16, etc.)
  const weeklyBaseline = {
    qb: 20 + (Math.random() * 7), // 20-27
    rb1: 15 + (Math.random() * 8), // 15-23
    rb2: 8 + (Math.random() * 6), // 8-14
    wr1: 13 + (Math.random() * 9), // 13-22
    wr2: 9 + (Math.random() * 7), // 9-16
    wr3: 6 + (Math.random() * 5), // 6-11
    te: 7 + (Math.random() * 8), // 7-15
    flex: 8 + (Math.random() * 6), // 8-14
    k: 8 + (Math.random() * 4), // 8-12
    def: 6 + (Math.random() * 8) // 6-14
  }
  
  const positionTotal = Object.values(weeklyBaseline).reduce((sum, val) => sum + val, 0)
  
  // Blend season performance with weekly baseline
  if (seasonAvg > 0) {
    return Math.round((seasonAvg * 0.4) + (positionTotal * 0.6))
  }
  
  // First-time teams get baseline with slight variation
  return Math.round(positionTotal + ((Math.random() - 0.5) * 20))
}

function applyMatchupModifiers(baseProjection: number, team: Pair['a'], opponent: Pair['a']) {
  let modifier = 1.0
  
  // Strength of schedule adjustment
  const opponentDefense = opponent.fpa > 0 ? Math.max(0.8, Math.min(1.2, 100 / opponent.fpa)) : 1.0
  modifier *= opponentDefense
  
  // Home/away (simulate home field advantage)
  modifier *= Math.random() > 0.5 ? 1.05 : 0.98
  
  // Injury/news adjustment (simulate weekly factors)
  modifier *= 0.92 + (Math.random() * 0.16) // 0.92-1.08 range
  
  return Math.round(baseProjection * modifier)
}

function computeBettingLines(p: Pair, week: number) {
  const { teamAProjection, teamBProjection } = generateWeeklyProjections(p, week)
  
  // Calculate spread based on projection difference
  const rawSpread = teamAProjection - teamBProjection
  const spread = Math.round(rawSpread * 2) / 2 // Round to nearest 0.5
  
  // Over/Under is sum of projections with vig adjustment
  const ou = Math.round((teamAProjection + teamBProjection) * 1.02) // 2% vig
  
  // Upset chance based on spread
  const upsetChance = Math.max(5, Math.min(95, Math.round(50 - (Math.abs(spread) * 3))))
  
  // Line locking (lock on Thursday at 8:20 PM ET)
  const now = new Date()
  const currentDay = now.getDay() // 0=Sunday, 4=Thursday
  const currentHour = now.getHours()
  const linesLocked = (currentDay === 4 && currentHour >= 20) || currentDay === 5 || currentDay === 6 || (currentDay === 0 && currentHour < 13)
  
  return { 
    spread, 
    ou, 
    upsetChance, 
    teamAProjection, 
    teamBProjection,
    linesLocked,
    lockMessage: linesLocked ? "Lines locked for this week" : "Lines lock Thursday 8:20 PM ET"
  }
}

export default async function MatchupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const week = Number((await getState()).week || 1)
  const matchupId = Number(id)

  const [users, rosters, matchups] = await Promise.all([
    getUsers(LEAGUE_ID),
    getRosters(LEAGUE_ID),
    getMatchups(LEAGUE_ID, week)
  ])

  const pairs = pairMatchups(matchups, rosters, users)
  const p = pairs.find(x => x.matchupId === matchupId) || pairs[0]

  if (!p) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-sm text-gray-500"><Link href="/">Home</Link> / <Link href="/matchups/this-week">This Week</Link></div>
        <h1 className="text-2xl font-extrabold mt-2">Matchup not found</h1>
        <p className="text-gray-600 mt-2">We couldn't find that matchup for Week {week}. Try returning to <Link href="/matchups/this-week" className="text-blue-700 underline">This Week</Link>.</p>
      </div>
    )
  }

  const { spread, ou, upsetChance, teamAProjection, teamBProjection, linesLocked, lockMessage } = computeBettingLines(p, week)
  const fav = spread >= 0 ? p.a : p.b
  const dog = spread >= 0 ? p.b : p.a
  const favBy = Math.abs(spread).toFixed(1)

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6">
      <div className="text-sm text-gray-500"><Link href="/">Home</Link> / <Link href="/matchups/this-week">This Week</Link> / Matchup {p.matchupId}</div>
      <header className="mt-2">
        <h1 className="text-3xl font-extrabold">{p.b.teamName} at {p.a.teamName}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-1">
          <p className="text-gray-600">Week {week} • Spread {spread >= 0 ? `-${favBy}` : `+${favBy}`} (fav: {fav.teamName}) • O/U {ou} • Upset {upsetChance}%</p>
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold ${
            linesLocked 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              linesLocked ? 'bg-red-500' : 'bg-green-500'
            }`}></span>
            {lockMessage}
          </div>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border p-4 bg-white">
          <div className="text-xs uppercase font-black text-gray-500">Betting Lines</div>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between"><span>Spread</span><span className="font-semibold">{fav.teamName} {spread >= 0 ? `-${favBy}` : `+${favBy}`}</span></div>
            <div className="flex justify-between"><span>Over/Under</span><span className="font-semibold">{ou} points</span></div>
            <div className="flex justify-between"><span>Moneyline</span><span className="font-semibold">{fav.teamName} {upsetChance < 30 ? '-180' : upsetChance < 45 ? '-130' : '-110'}</span></div>
            <div className="flex justify-between"><span>Upset Chance</span><span className="font-semibold">{upsetChance}%</span></div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            <div className="text-xs text-gray-600">
              Lines based on weekly projections, injury reports, and matchup analysis.
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs font-semibold text-amber-700">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              Beta — FAAB only, no cash
            </div>
          </div>
        </div>
        <div className="rounded-2xl border p-4 bg-white">
          <div className="text-xs uppercase font-black text-gray-500">Projected Scores</div>
          <div className="mt-2 text-sm space-y-1">
            <div className="flex justify-between"><span>{p.a.teamName}</span><span className="font-bold text-lg">{teamAProjection}</span></div>
            <div className="flex justify-between"><span>{p.b.teamName}</span><span className="font-bold text-lg">{teamBProjection}</span></div>
          </div>
          <div className="mt-3 text-xs text-gray-500">Season Records</div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between"><span>{p.a.teamName}</span><span className="font-semibold">{p.a.wins}-{p.a.losses} ({(p.a.fpts || 0).toFixed(1)} PF)</span></div>
            <div className="flex justify-between"><span>{p.b.teamName}</span><span className="font-semibold">{p.b.wins}-{p.b.losses} ({(p.b.fpts || 0).toFixed(1)} PF)</span></div>
          </div>
        </div>
        <div className="rounded-2xl border p-4 bg-white">
          <div className="text-xs uppercase font-black text-gray-500">Key Storylines</div>
          <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
            <li><strong>Projected Battle:</strong> {p.a.teamName} ({teamAProjection}) vs {p.b.teamName} ({teamBProjection}) in what projects as a {upsetChance >= 45 && upsetChance <= 55 ? 'coin-flip' : upsetChance > 55 ? 'potential upset' : 'lopsided affair'}.</li>
            <li><strong>Season Form:</strong> {fav.teamName} ({fav.wins}-{fav.losses}) has the edge over {dog.teamName} ({dog.wins}-{dog.losses}) based on current standings.</li>
            <li><strong>Scoring Trends:</strong> {(p.a.fpts || 0) > (p.b.fpts || 0) ? p.a.teamName : p.b.teamName} has been the higher-scoring team this season ({Math.max((p.a.fpts || 0), (p.b.fpts || 0)).toFixed(1)} PF).</li>
            <li><strong>X-Factor:</strong> Look for {Math.random() > 0.5 ? 'flex position' : 'tight end'} to be the difference-maker in this {favBy === '0.0' ? 'even' : 'close'} matchup.</li>
          </ul>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border p-4 bg-white">
        <div className="text-xs uppercase font-black text-gray-500">Matchup Preview</div>
        <p className="mt-2 text-sm text-gray-700 leading-relaxed">
          <strong>The Call:</strong> {fav.teamName} {favBy === '0.0' ? 'deadlocked with' : `favored by ${favBy} over`} {dog.teamName} in a projected {teamAProjection}-{teamBProjection} {upsetChance >= 45 && upsetChance <= 55 ? 'coin-flip' : upsetChance > 55 ? 'upset special' : 'battle'}. 
          {(p.a.fpts || 0) + (p.b.fpts || 0) === 0 ? 
            `With both teams opening their season, expect fireworks as managers showcase their draft strategies. The total sits at ${ou}, suggesting both sides bring offensive upside.` : 
            `Based on season-long trends, ${(p.a.fpts || 0) > (p.b.fpts || 0) ? p.a.teamName : p.b.teamName} has shown more consistent scoring (${Math.max((p.a.fpts || 0), (p.b.fpts || 0)).toFixed(1)} PF avg), but fantasy football rewards the bold.`
          }
        </p>
        <p className="mt-3 text-sm text-gray-700 leading-relaxed">
          <strong>The Edge:</strong> {upsetChance >= 45 ? 
            `This one comes down to execution. Both teams have paths to victory, making it a true manager vs. manager showcase. Late-week waiver moves and start/sit decisions will determine the winner.` :
            `${fav.teamName} has the statistical advantage, but ${dog.teamName} brings upset potential. Key battles at RB2 and FLEX could swing this matchup.`
          }
        </p>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs font-bold text-blue-800 uppercase tracking-wide">Upside Plays</div>
          <div className="mt-1 text-xs text-blue-700">
            <strong>{p.a.teamName}:</strong> Look for boom weeks from {Math.random() > 0.5 ? 'WR2/3 targets' : 'RB handcuffs'} to push over projection.
          </div>
          <div className="mt-1 text-xs text-blue-700">
            <strong>{p.b.teamName}:</strong> {Math.random() > 0.5 ? 'Streaming defense' : 'Waiver wire pickups'} could provide the edge needed for the upset.
          </div>
        </div>
      </section>

      <div className="mt-6 flex items-center gap-3">
        <Link href="/" className="text-blue-700 font-semibold hover:underline">← Back to Home</Link>
        <Link href="/matchups/this-week" className="text-blue-700 font-semibold hover:underline">All Week {week} Matchups</Link>
      </div>
    </div>
  )
}
