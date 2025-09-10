// NFL.com-inspired homepage with ?league= override. Server component—do NOT add "use client".
import Link from "next/link"
import { ArrowRight, Trophy, Flame, ChevronRight, Play, Newspaper, Menu } from "lucide-react"

export const revalidate = 60 // refresh data every 60s

// ---- Config ----
const DEFAULT_LEAGUE_ID = process.env.LEAGUE_ID || "1234567890123456789"
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Fantasy Tavern"
const SLEEPER = "https://api.sleeper.app/v1"

// ---- Types (subset) ----
type SleeperUser = { user_id: string; display_name: string; avatar?: string; metadata?: Record<string, any> }
type SleeperRoster = { roster_id: number; owner_id: string | null; players?: string[]; starters?: string[]; settings: { wins: number; losses: number; ties: number; fpts: number; fpts_against: number }; metadata?: Record<string, any> }
type SleeperMatchup = { roster_id: number; matchup_id: number; points: number; players_points?: Record<string, number> }

type Pair = {
  a: { rosterId: number; teamName: string; ownerName: string; points: number; wins: number; losses: number; fpts: number; fpa: number }
  b: { rosterId: number; teamName: string; ownerName: string; points: number; wins: number; losses: number; fpts: number; fpa: number }
  matchupId: number
}

type Headline = { kind: 'PREVIEW'|'RECAP'|'TRADE'; title: string; subtitle?: string; href: string }
type TickerItem = { home: string; away: string; hs: number; as: number; q: string; href: string }

// ---- Data helpers ----
async function sx(path: string) {
  const r = await fetch(`${SLEEPER}${path}`, { next: { revalidate } })
  if (!r.ok) throw new Error(`Sleeper fetch failed: ${path}`)
  return r.json()
}
async function getState() { return sx(`/state/nfl`) }
async function getUsers(leagueId: string): Promise<SleeperUser[]> { return sx(`/league/${leagueId}/users`) }
async function getRosters(leagueId: string): Promise<SleeperRoster[]> { return sx(`/league/${leagueId}/rosters`) }
async function getMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> { return sx(`/league/${leagueId}/matchups/${week}`) }
async function getTrendingAdds(hours = 48, limit = 10): Promise<{player_id: string; count: number}[]> { return sx(`/players/trending/add?lookback_hours=${hours}&limit=${limit}`) }
async function getTransactions(leagueId: string, week: number): Promise<any[]> { return sx(`/league/${leagueId}/transactions/${week}`) }

// ---- Transforms ----
function shortTag(name: string) { const clean = name.replace(/[^A-Za-z0-9]/g, "").toUpperCase(); return clean.slice(0, 3) || "TEAM" }
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
function chooseRivalry(pairs: Pair[]) { const power = (t: Pair["a"]) => 0.7*(t.wins - t.losses) + 0.3*((t.fpts - t.fpa)/100); let best: Pair | null = null; let bestDiff = Infinity; for (const p of pairs) { const diff = Math.abs(power(p.a) - power(p.b)); if (diff < bestDiff) { bestDiff = diff; best = p } } return best }
function computeSpreadOU(p: Pair) { const power = (t: Pair["a"]) => 0.7*(t.wins - t.losses) + 0.3*((t.fpts - t.fpa)/100); const s = power(p.a) - power(p.b); const spread = Math.round(s * 6 * 10) / 10; const ou = Math.round(((p.a.fpts + p.b.fpts) / Math.max(1, (p.a.wins+p.a.losses+p.b.wins+p.b.losses))) * 1.05); const upsetChance = Math.max(5, Math.min(95, Math.round(50 - spread*4))); return { spread, ou, upsetChance } }
function standingsFromRosters(rosters: SleeperRoster[], users: SleeperUser[]) { const userById = new Map(users.map(u => [u.user_id, u])); return rosters.map(r => ({ team: r.metadata?.team_name || userById.get(r.owner_id || "")?.display_name || `Team ${r.roster_id}`, w: r.settings.wins, l: r.settings.losses, pf: r.settings.fpts, pa: r.settings.fpts_against, })).sort((a,b)=> (b.w - a.w) || (b.pf - a.pf)) }
function buildHeadlines(current: Pair[], prev: Pair[], trades: any[]): Headline[] {
  const items: Headline[] = []
  const scored = current.map(p => { const { spread } = computeSpreadOU(p); const tight = 20 - Math.min(20, Math.abs(spread)*2); const combinedPf = (p.a.fpts + p.b.fpts); const score = tight*0.6 + combinedPf*0.4; return { p, score } }).sort((a,b)=> b.score - a.score).slice(0,2)
  for (const s of scored) { const { spread, ou } = computeSpreadOU(s.p); items.push({ kind:'PREVIEW', title: `${s.p.a.teamName} vs ${s.p.b.teamName}`, subtitle: `Spread ${spread>=0?'-'+Math.abs(spread):'+'+Math.abs(spread)} • O/U ${ou}`, href: `/matchups/${s.p.matchupId}` }) }
  const prevWithMargin = prev.map(p => ({ p, margin: Math.abs((p.a.points||0)-(p.b.points||0)) })).filter(x => (x.p.a.points||0) > 0 || (x.p.b.points||0) > 0).sort((a,b)=> a.margin - b.margin).slice(0,2)
  for (const r of prevWithMargin) { const winner = r.p.a.points >= r.p.b.points ? r.p.a : r.p.b; const loser = r.p.a.points >= r.p.b.points ? r.p.b : r.p.a; items.push({ kind:'RECAP', title: `${winner.teamName} ${winner.points.toFixed(1)} def. ${loser.teamName} ${loser.points.toFixed(1)}`, subtitle: `Decided by ${r.margin.toFixed(1)} pts`, href: `/matchups/${r.p.matchupId}` }) }
  const tradeTx = trades?.filter(t => t?.type === 'trade').slice(0,2) || []
  for (const t of tradeTx) { const teams = (t.roster_ids || []).join(' ↔︎ '); items.push({ kind:'TRADE', title: `Trade completed`, subtitle: `Rosters ${teams}`, href: `/news/trades` }) }
  return items
}

// ---- UI helpers ----
function SiteNav() {
  const links = [
    { href: "/news", label: "News" },
    { href: "/scores", label: "Scores" },
    { href: "/standings", label: "Standings" },
    { href: "/teams", label: "Teams" },
    { href: "/rivalries", label: "Rivalries" },
    { href: "/odds", label: "Odds" },
    { href: "/betting", label: "Betting" },
    { href: "/articles", label: "Articles" },
    { href: "/register", label: "Register" },
  ]
  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-7 w-7 rounded bg-blue-700 text-white text-[11px] font-black">HL</span>
          <span className="font-extrabold tracking-tight">{SITE_NAME}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="text-xs font-extrabold tracking-wide italic text-gray-800 hover:text-blue-700">
              {l.label}
            </Link>
          ))}
        </nav>
        <button className="md:hidden p-2"><Menu className="h-5 w-5" /></button>
      </div>
    </header>
  )
}

function SectionTitle(props: { title: string; badge?: string; href?: string }) {
  const { title, badge, href } = props
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight italic">{title}</h2>
      <div className="flex items-center gap-2">
        {badge && (<span className="rounded-full bg-orange-500 text-white text-[10px] font-black px-2 py-1 uppercase">{badge}</span>)}
        {href && (<Link href={href} className="text-xs sm:text-sm font-semibold text-blue-700 hover:underline flex items-center gap-1">View all <ChevronRight className="h-4 w-4" /></Link>)}
      </div>
    </div>
  )
}

function LiveScoresTicker({ items }: { items: TickerItem[] }) {
  return (
    <div className="w-full bg-black text-gray-100 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-3 overflow-hidden">
        <div className="flex gap-6 py-2 animate-[marquee_16s_linear_infinite]" style={{ whiteSpace: "nowrap" }}>
          {items.map((g, i) => (
            <Link key={i} href={g.href} className="flex items-center gap-2 text-xs sm:text-sm hover:opacity-90">
              <span className="font-mono bg-gray-800 rounded px-1.5 py-0.5">{g.away}</span>
              <span className="font-semibold">{g.as.toFixed(1)}</span>
              <span className="opacity-60">@</span>
              <span className="font-mono bg-gray-800 rounded px-1.5 py-0.5">{g.home}</span>
              <span className="font-semibold">{g.hs.toFixed(1)}</span>
              <span className="ml-2 text-[10px] uppercase tracking-wide opacity-70">{g.q}</span>
            </Link>
          ))}
        </div>
      </div>
      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  )
}

function HeadlinesRail({ items }: { items: Headline[] }) {
  const pill = (k: Headline['kind']) => {
    const map: Record<string,string> = { PREVIEW:'bg-blue-600', RECAP:'bg-gray-900', TRADE:'bg-amber-600' }
    return map[k]
  }
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map((h, i) => (
          <Link key={i} href={h.href} className="flex items-start gap-3 p-3 rounded-xl border hover:shadow-sm">
            <span className={`${pill(h.kind)} text-white text-[10px] font-black px-2 py-1 rounded uppercase`}>{h.kind}</span>
            <div className="min-w-0">
              <div className="font-extrabold leading-snug truncate">{h.title}</div>
              {h.subtitle && <div className="text-xs text-gray-600 truncate">{h.subtitle}</div>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function FeaturedHero({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="relative h-80 sm:h-96 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b2a5b] via-blue-800 to-indigo-900 shadow-xl">
      <div className="absolute inset-0 bg-[url('/grid-noise.png')] opacity-20" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 h-full p-6 sm:p-8 flex flex-col justify-end">
        <span className="inline-flex items-center gap-1 bg-red-600/90 text-white text-[10px] font-black px-2 py-1 rounded w-fit uppercase mb-2"><Play className="h-3 w-3" /> Game of the Week</span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">{title}</h1>
        <p className="text-gray-200 mt-2 text-sm sm:text-base max-w-2xl">{sub}</p>
        <div className="mt-4 flex items-center gap-3">
          <Link href="/matchups/this-week" className="inline-flex items-center gap-1.5 rounded-full bg-white text-black text-xs font-bold px-3 py-1.5">See matchups <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/rivalries" className="text-white/90 underline underline-offset-4 text-xs">Rivalry history</Link>
        </div>
      </div>
    </div>
  )
}

function SecondaryFeature() {
  return (
    <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-600 via-orange-700 to-red-700 shadow-xl">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 p-6 h-full flex flex-col justify-end">
        <span className="inline-block bg-purple-600 text-white text-[10px] font-black px-2 py-1 rounded w-fit uppercase mb-2">Feature</span>
        <h3 className="text-white text-xl sm:text-2xl font-extrabold">Power Rankings — Week 1</h3>
        <p className="text-white/85 text-sm mt-1">Who tops the board after draft day? Our model explains the tiers.</p>
      </div>
    </div>
  )
}

function WhatsLive() {
  return (
    <section className="px-2 sm:px-0">
      <SectionTitle title="WHAT'S LIVE" badge="LIVE" href="/live" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="flex gap-2 mb-2">
              <span className="bg-blue-600 text-[10px] font-black px-1.5 py-0.5 rounded">LIVE</span>
              <span className="bg-red-600 text-[10px] font-black px-1.5 py-0.5 rounded">HIGHLIGHTS</span>
            </div>
            <h4 className="font-extrabold text-lg leading-tight">Week 1 Preview: Opening Night Storylines</h4>
            <p className="text-xs text-white/85 mt-1">Key matchups and projections to watch before kickoff.</p>
          </div>
        </div>
        <div className="rounded-2xl p-6 min-h-[220px] text-white bg-gradient-to-br from-purple-700 to-blue-700 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded uppercase">Featured</span>
            <span className="text-xs opacity-80">Preview</span>
          </div>
          <h4 className="text-xl font-extrabold">Opening Night: Contenders & Dark Horses</h4>
          <p className="text-xs sm:text-sm text-white/90 mt-1">Our model's first look at ceilings, floors, and schedule difficulty.</p>
        </div>
      </div>
    </section>
  )
}

function TrendingPlayers({ list }: { list: { name: string; tag: string }[] }) {
  return (
    <section>
      <SectionTitle title="Trending Players" href="/trending" />
      <div className="flex flex-wrap gap-2">
        {list.map((p) => (
          <span key={p.name} className="inline-flex items-center gap-2 bg-gray-100 text-gray-900 px-3 py-1.5 rounded-full text-xs font-semibold">
            <Flame className="h-4 w-4 text-orange-600" /> {p.name}
            <span className="text-xs text-gray-500">{p.tag}</span>
          </span>
        ))}
      </div>
    </section>
  )
}

function WeeklyRivalryCard({ p }: { p: Pair | null }) {
  if (!p) return null
  const { spread, ou, upsetChance } = computeSpreadOU(p)
  return (
    <section>
      <SectionTitle title="Rivalry of the Week" href="/rivalries" />
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 p-6 bg-white">
            <div className="flex items-center gap-2 text-xs text-gray-500"><Trophy className="h-4 w-4 text-amber-500" /> Lifetime — (first season or unavailable) • Avg margin —</div>
            <h3 className="text-2xl font-extrabold mt-2">{p.a.teamName} ({spread >= 0 ? `-${Math.abs(spread)}` : `+${Math.abs(spread)}`}) vs {p.b.teamName}</h3>
            <p className="text-sm text-gray-600 mt-1">Playoff impact: — • Upset chance: {upsetChance}%</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-[10px] uppercase font-black bg-blue-600 text-white rounded px-2 py-1">Feature</span>
              <span className="text-[10px] uppercase font-black bg-gray-900 text-white rounded px-2 py-1">Preview</span>
            </div>
          </div>
          <div className="p-6 bg-gray-50 flex flex-col justify-center gap-2">
            <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Spread</span><span className="font-bold">{spread >= 0 ? `-${Math.abs(spread)}` : `+${Math.abs(spread)}`}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-gray-600">O/U</span><span className="font-bold">{ou}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Upset %</span><span className="font-bold">{upsetChance}%</span></div>
            <Link href={`/matchups/${p.matchupId}`} className="mt-3 inline-flex items-center gap-2 text-blue-700 font-semibold hover:underline">Full preview <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function PowerRankingsPreview({ rows }: { rows: { rank: number; team: string; score: number; tier: string }[] }) {
  return (
    <section>
      <SectionTitle title="Power Rankings" href="/rankings" />
      <div className="rounded-2xl overflow-hidden border border-gray-200">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.rank} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 pl-4 w-10 font-extrabold text-gray-800">{r.rank}</td>
                <td className="py-3 font-semibold">{r.team}</td>
                <td className="py-3 text-gray-500">Tier {r.tier}</td>
                <td className="py-3 pr-4 text-right font-bold">{r.score.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function PlayoffOddsWidget({ data }: { data: { team: string; pct: number }[] }) {
  return (
    <section>
      <SectionTitle title="Playoff Odds" href="/odds" />
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.team} className="flex items-center gap-3">
            <div className="w-28 text-xs font-semibold text-gray-700 truncate">{d.team}</div>
            <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full bg-green-600" style={{ width: `${d.pct}%` }} />
            </div>
            <div className="w-10 text-right text-xs font-bold">{d.pct}%</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function NewsSidebar() {
  const items = [
    { n: 42, title: "Projected win totals: ceilings & floors" },
    { n: 43, title: "Trade watch: early rumblings" },
    { n: 44, title: "Waiver wire: opening week" },
    { n: 45, title: "Playoff predictions & wild cards" },
  ]
  const color = (n: number) => {
    const palette = ["bg-blue-700","bg-red-600","bg-orange-500","bg-green-600","bg-purple-600","bg-teal-600","bg-indigo-600"]
    return palette[n % palette.length]
  }
  return (
    <aside className="space-y-3">
      {items.map((it) => (
        <Link key={it.n} href="#" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
          <span className={`min-w-[28px] text-center rounded text-white text-xs font-black px-2 py-1 ${color(it.n)}`}>{it.n}</span>
          <span className="text-sm font-bold text-gray-900 leading-tight">{it.title}</span>
        </Link>
      ))}
    </aside>
  )
}

function MatchupsSidebar({ pairs }: { pairs: Pair[] }) {
  if (!pairs.length) return null
  return (
    <section className="mt-6">
      <SectionTitle title="This Week's Matchups" href="/matchups/this-week" />
      <div className="rounded-2xl overflow-hidden border">
        <ul className="divide-y">
          {pairs.map(p => {
            const { spread } = computeSpreadOU(p)
            return (
              <li key={p.matchupId}>
                <Link href={`/matchups/${p.matchupId}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5">{shortTag(p.b.teamName)}</span>
                    <span className="text-xs text-gray-500">@</span>
                    <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5">{shortTag(p.a.teamName)}</span>
                    <span className="ml-2 text-sm font-semibold truncate">{p.b.teamName} at {p.a.teamName}</span>
                  </div>
                  <div className="text-xs font-bold text-gray-700">{spread>=0?`-${Math.abs(spread)}`:`+${Math.abs(spread)}`}</div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function RecentArticles() {
  const articles = [
    { id: 1, title: "Week 1 Power Tiers", time: "3 min read" },
    { id: 2, title: "Rivalry Preview: Featured Matchup", time: "4 min read" },
    { id: 3, title: "Waiver Watch: Opening Week", time: "2 min read" },
  ]
  return (
    <section>
      <SectionTitle title="Latest Articles" href="/articles" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {articles.map((a) => (
          <Link key={a.id} href={`/articles/${a.id}`} className="rounded-2xl border hover:shadow bg-white p-4 group">
            <div className="flex items-center gap-2 text-[10px] uppercase text-gray-500 font-black"><Newspaper className="h-3.5 w-3.5"/> Article</div>
            <h4 className="mt-1 font-extrabold leading-snug group-hover:underline">{a.title}</h4>
            <p className="text-xs text-gray-500 mt-1">{a.time}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function StandingsSnapshot({ rows }: { rows: { team: string; w: number; l: number; pf: number; pa: number }[] }) {
  return (
    <section className="mt-6">
      <SectionTitle title="Standings" href="/standings" />
      <div className="rounded-2xl overflow-hidden border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-2">Team</th>
              <th className="text-right px-4 py-2">W</th>
              <th className="text-right px-4 py-2">L</th>
              <th className="text-right px-4 py-2">PF</th>
              <th className="text-right px-4 py-2">PA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.team} className="border-t">
                <td className="px-4 py-2 font-semibold">{r.team}</td>
                <td className="px-4 py-2 text-right">{r.w}</td>
                <td className="px-4 py-2 text-right">{r.l}</td>
                <td className="px-4 py-2 text-right">{r.pf?.toFixed(1) || '0.0'}</td>
                <td className="px-4 py-2 text-right">{r.pa?.toFixed(1) || '0.0'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ---- Page (server component) ----
export default async function NFLStyleHomePage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  try {
    const state = await getState().catch(() => ({ week: 1 }))
    const week = Number(state?.week || 1)
    const prevWeek = Math.max(1, week - 1)

    const params = searchParams ? await searchParams : undefined
    const activeLeagueId = typeof params?.league === "string" && params.league ? params.league : DEFAULT_LEAGUE_ID

    const [users, rosters, matchups, prevMatchups, trades] = await Promise.all([
      getUsers(activeLeagueId).catch(() => []),
      getRosters(activeLeagueId).catch(() => []),
      getMatchups(activeLeagueId, week).catch(() => []),
      getMatchups(activeLeagueId, prevWeek).catch(()=>[]),
      getTransactions(activeLeagueId, week).catch(()=>[]),
    ])

  const pairs = pairMatchups(matchups, rosters, users)
  const prevPairs = pairMatchups(prevMatchups, rosters, users)
  const rivalry = chooseRivalry(pairs)

  const ticker: TickerItem[] = pairs.map(p => ({
    home: shortTag(p.a.teamName),
    away: shortTag(p.b.teamName),
    hs: p.a.points,
    as: p.b.points,
    q: `Week ${week}`,
    href: `/matchups/${p.matchupId}`
  }))

  const headlines = buildHeadlines(pairs, prevPairs, trades)
  const standings = standingsFromRosters(rosters, users).slice(0, 6)

  let trending: { name: string; tag: string }[] = []
  try { const adds = await getTrendingAdds(48, 8); trending = adds.map(a => ({ name: a.player_id, tag: `+${a.count} adds` })) } catch {}

  const pow = (r: ReturnType<typeof standingsFromRosters>[number]) => r.w*20 + (r.pf - r.pa)/5
  const powerRows = standings.map((r, i) => ({ rank: i+1, team: r.team, score: Math.max(50, Math.min(95, Math.round(pow(r)))), tier: pow(r) > 60 ? "S" : pow(r) > 40 ? "A" : "B" }))

  const totalWins = standings.reduce((s, r) => s + r.w, 0) || 1
  const odds = standings.map(r => ({ team: r.team, pct: Math.max(5, Math.min(90, Math.round((r.w/totalWins)*100))) }))

    const heroTitle = rivalry ? `${rivalry.a.teamName} vs ${rivalry.b.teamName}` : (pairs[0] ? `${pairs[0].a.teamName} vs ${pairs[0].b.teamName}` : `Week ${week}`)
    const heroSub = rivalry && pairs[0] ? `Projected spread ${computeSpreadOU(rivalry).spread >= 0 ? "-"+Math.abs(computeSpreadOU(rivalry).spread) : "+"+Math.abs(computeSpreadOU(rivalry).spread)} • O/U ${computeSpreadOU(rivalry).ou}` : `Week ${week}`

    return (
      <div className="min-h-screen bg-white">
        <SiteNav />
        <LiveScoresTicker items={ticker} />
        <HeadlinesRail items={headlines} />
        <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <FeaturedHero title={heroTitle} sub={heroSub} />
            </div>
            <div className="lg:col-span-1"><SecondaryFeature /></div>
          </div>
          <div className="mt-6"><WhatsLive /></div>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <WeeklyRivalryCard p={rivalry || null} />
              <PowerRankingsPreview rows={powerRows} />
              <TrendingPlayers list={trending.length ? trending : [{ name: "Players", tag: "+adds" }]} />
              <RecentArticles />
            </div>
            <div className="lg:col-span-1">
              <MatchupsSidebar pairs={pairs} />
              <PlayoffOddsWidget data={odds} />
              <StandingsSnapshot rows={standings} />
              <NewsSidebar />
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading Fantasy Football Hub:', error)
    
    // Fallback UI when API calls fail
    return (
      <div className="min-h-screen bg-white">
        <SiteNav />
        <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="text-center py-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Fantasy Football Hub</h1>
            <p className="text-lg text-gray-600 mb-8">Welcome to your fantasy football dashboard!</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-yellow-800 mb-2">Getting Started</h2>
              <p className="text-yellow-700 mb-4">
                The app is loading your league data. If you're seeing this message, there might be an issue with the API connection.
              </p>
              <div className="space-y-2 text-sm text-yellow-600">
                <p>• Make sure you have a valid league ID</p>
                <p>• Check your internet connection</p>
                <p>• Try refreshing the page</p>
              </div>
            </div>
            <div className="mt-8">
              <RecentArticles />
            </div>
          </div>
        </main>
      </div>
    )
  }
}
