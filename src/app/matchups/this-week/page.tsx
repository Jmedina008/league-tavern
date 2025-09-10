import Link from "next/link"

export const revalidate = 60
const SLEEPER = "https://api.sleeper.app/v1"
const LEAGUE_ID = process.env.LEAGUE_ID || "1180507846524702720"

type User = { user_id: string; display_name: string; metadata?: Record<string, any> }
type Roster = { roster_id: number; owner_id: string | null; metadata?: Record<string, any>; settings: { wins: number; losses: number; fpts: number; fpts_against: number } }
type Matchup = { roster_id: number; matchup_id: number; points: number }

async function sx(path: string) { const r = await fetch(`${SLEEPER}${path}`, { next: { revalidate } }); if (!r.ok) throw new Error(`Sleeper fetch failed: ${path}`); return r.json() }
async function getState() { return sx(`/state/nfl`) }
async function getUsers(leagueId: string): Promise<User[]> { return sx(`/league/${leagueId}/users`) }
async function getRosters(leagueId: string): Promise<Roster[]> { return sx(`/league/${leagueId}/rosters`) }
async function getMatchups(leagueId: string, week: number): Promise<Matchup[]> { return sx(`/league/${leagueId}/matchups/${week}`) }

function tag3(name: string) { return (name||"TEAM").replace(/[^A-Za-z0-9]/g,"").toUpperCase().slice(0,3) || "TEAM" }

export default async function ThisWeekPage() {
  const week = Number((await getState()).week || 1)
  const [users, rosters, matchups] = await Promise.all([
    getUsers(LEAGUE_ID),
    getRosters(LEAGUE_ID),
    getMatchups(LEAGUE_ID, week)
  ])

  const userById = new Map(users.map(u => [u.user_id, u]))
  const rosterById = new Map(rosters.map(r => [r.roster_id, r]))

  const byId = new Map<number, Matchup[]>()
  for (const m of matchups) { const arr = byId.get(m.matchup_id) || []; arr.push(m); byId.set(m.matchup_id, arr) }

  const pairs = Array.from(byId.entries()).map(([mid, arr]) => {
    if (arr.length < 2) return null
    const r1 = rosterById.get(arr[0].roster_id)!; const r2 = rosterById.get(arr[1].roster_id)!
    const u1 = r1.owner_id ? userById.get(r1.owner_id) : undefined
    const u2 = r2.owner_id ? userById.get(r2.owner_id) : undefined
    const nameFrom = (r: Roster, u?: User) => r.metadata?.team_name || u?.metadata?.team_name || u?.display_name || `Team ${r.roster_id}`
    return {
      matchupId: mid,
      a: { team: nameFrom(r1, u1), pf: r1.settings.fpts, pa: r1.settings.fpts_against, points: Math.round((arr.find(x=>x.roster_id===r1.roster_id)?.points||0)*10)/10 },
      b: { team: nameFrom(r2, u2), pf: r2.settings.fpts, pa: r2.settings.fpts_against, points: Math.round((arr.find(x=>x.roster_id===r2.roster_id)?.points||0)*10)/10 },
    }
  }).filter(Boolean) as { matchupId:number; a:{team:string; pf:number; pa:number; points:number}; b:{team:string; pf:number; pa:number; points:number} }[]

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6">
      <div className="text-sm text-gray-500"><Link href="/">Home</Link> / This Week</div>
      <h1 className="text-3xl font-extrabold mt-2">Week {week} — Matchups</h1>

      <div className="mt-4 rounded-2xl overflow-hidden border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-2">Matchup</th>
              <th className="text-right px-4 py-2">Score</th>
              <th className="text-right px-4 py-2">PF (avg)</th>
              <th className="text-right px-4 py-2">Link</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map(p => (
              <tr key={p.matchupId} className="border-t">
                <td className="px-4 py-3 flex items-center gap-2">
                  <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5">{tag3(p.b.team)}</span>
                  <span className="text-xs text-gray-500">@</span>
                  <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5">{tag3(p.a.team)}</span>
                  <span className="ml-2 font-semibold truncate">{p.b.team} at {p.a.team}</span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">{p.b.points.toFixed(1)} – {p.a.points.toFixed(1)}</td>
                <td className="px-4 py-3 text-right text-gray-600">{((p.a.pf + p.b.pf)/2).toFixed(1)}</td>
                <td className="px-4 py-3 text-right"><Link href={`/matchups/${p.matchupId}`} className="text-blue-700 font-semibold hover:underline">Preview</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6"><Link href="/" className="text-blue-700 font-semibold hover:underline">← Back to Home</Link></div>
    </div>
  )
}
