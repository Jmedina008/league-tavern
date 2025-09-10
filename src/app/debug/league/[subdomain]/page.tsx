import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { ArrowRight, Trophy, Flame, ChevronRight, Play, Newspaper, Menu } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DebugActions from '@/components/DebugActions'
import FantasyMatchupPreview from '@/components/matchup/FantasyMatchupPreview'
import PremiumMatchupRecap from '@/components/matchup/PremiumMatchupRecap'

const prisma = new PrismaClient()

interface DebugLeaguePageProps {
  params: Promise<{ subdomain: string }>
}

async function getLeagueData(subdomain: string) {
  try {
    const league = await prisma.league.findUnique({
      where: { subdomain },
      include: {
        commissioner: true,
        users: true,
        matchups: {
          where: { week: 18 }, // Current week - you'd make this dynamic
          include: { bets: true }
        }
      }
    })
    
    if (!league || !league.isActive) {
      return null
    }
    
    // Get current Sleeper data
    const [sleeperLeague, rosters, users] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${league.sleeperLeagueId}`).then(r => r.json()),
      fetch(`https://api.sleeper.app/v1/league/${league.sleeperLeagueId}/rosters`).then(r => r.json()),
      fetch(`https://api.sleeper.app/v1/league/${league.sleeperLeagueId}/users`).then(r => r.json())
    ])
    
    return {
      league,
      sleeperLeague,
      rosters,
      users
    }
  } catch (error) {
    console.error('Error fetching league data:', error)
    return null
  }
}

export default async function DebugLeaguePage({ params }: DebugLeaguePageProps) {
  const { subdomain } = await params
  
  if (!subdomain) {
    notFound()
  }
  
  const data = await getLeagueData(subdomain)
  
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">League Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-4">
                No league found with subdomain: <code className="bg-slate-700 px-2 py-1 rounded">{subdomain}</code>
              </p>
              <div className="space-y-2">
                <p className="text-slate-300">Available options:</p>
                <ul className="text-slate-400 text-sm space-y-1 ml-4">
                  <li>• Create a league first through <Link href="/onboard" className="text-blue-400 hover:text-blue-300">onboarding</Link></li>
                  <li>• Check if the subdomain spelling is correct</li>
                  <li>• Make sure the league is active</li>
                </ul>
              </div>
              <div className="mt-6">
                <Link href="/landing" className="text-blue-400 hover:text-blue-300">
                  ← Back to home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  const { league, sleeperLeague, rosters, users } = data
  
  // Calculate league stats
  const totalBets = league.matchups.reduce((acc, matchup) => acc + matchup.bets.length, 0)
  const activeBettors = new Set(league.matchups.flatMap(m => m.bets.map(b => b.userId))).size
  
  // Helper functions from original design
  const shortTag = (name: string) => {
    const clean = name.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
    return clean.slice(0, 3) || "TEAM"
  }

  const computeSpreadOU = (teamA: any, teamB: any) => {
    const power = (t: any) => 0.7*(t.wins - t.losses) + 0.3*((t.fpts - t.fpa)/100)
    const s = power(teamA) - power(teamB)
    const spread = Math.round(s * 6 * 10) / 10
    const ou = Math.round(((teamA.fpts + teamB.fpts) / Math.max(1, (teamA.wins+teamA.losses+teamB.wins+teamB.losses))) * 1.05)
    const upsetChance = Math.max(5, Math.min(95, Math.round(50 - spread*4)))
    return { spread, ou, upsetChance }
  }

  const SectionTitle = ({ title, badge, href }: { title: string; badge?: string; href?: string }) => (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight italic">{title}</h2>
      <div className="flex items-center gap-2">
        {badge && (<span className="rounded-full bg-orange-500 text-white text-[10px] font-black px-2 py-1 uppercase">{badge}</span>)}
        {href && (<Link href={href} className="text-xs sm:text-sm font-semibold text-blue-700 hover:underline flex items-center gap-1">View all <ChevronRight className="h-4 w-4" /></Link>)}
      </div>
    </div>
  )

  // Create sample rivalry from first two teams
  const rivalry = league.users.length >= 2 ? {
    a: {
      teamName: league.users[0].teamName,
      ownerName: league.users[0].ownerName,
      wins: 8, losses: 5, fpts: 1850, fpa: 1720
    },
    b: {
      teamName: league.users[1].teamName, 
      ownerName: league.users[1].ownerName,
      wins: 7, losses: 6, fpts: 1780, fpa: 1840
    }
  } : null

  const { spread, ou, upsetChance } = rivalry ? computeSpreadOU(rivalry.a, rivalry.b) : { spread: 0, ou: 0, upsetChance: 50 }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-12 flex items-center justify-between">
          <Link href={`/debug/league/${subdomain}`} className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded bg-blue-700 text-white text-[11px] font-black">HL</span>
            <span className="font-extrabold tracking-tight">{league.name}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href={`/debug/league/${subdomain}`} className="text-xs font-extrabold tracking-wide italic text-blue-700">Home</Link>
            <Link href={`/debug/league/${subdomain}/chat`} className="text-xs font-extrabold tracking-wide italic text-gray-800 hover:text-blue-700">Chat</Link>
            <Link href="#" className="text-xs font-extrabold tracking-wide italic text-gray-800 hover:text-blue-700">Scores</Link>
            <Link href="#" className="text-xs font-extrabold tracking-wide italic text-gray-800 hover:text-blue-700">Standings</Link>
            <Link href="#" className="text-xs font-extrabold tracking-wide italic text-gray-800 hover:text-blue-700">Teams</Link>
            <Link href="#" className="text-xs font-extrabold tracking-wide italic text-gray-800 hover:text-blue-700">Betting</Link>
          </nav>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-yellow-500 text-black font-black px-2 py-1 rounded uppercase">DEBUG</span>
            <button className="md:hidden p-2"><Menu className="h-5 w-5" /></button>
          </div>
        </div>
      </header>

      {/* Live Scores Ticker */}
      <div className="w-full bg-black text-gray-100 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-3 overflow-hidden">
          <div className="flex gap-6 py-2 animate-[marquee_16s_linear_infinite]" style={{ whiteSpace: "nowrap" }}>
            {league.users.slice(0, 6).map((user, i) => (
              <div key={i} className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="font-mono bg-gray-800 rounded px-1.5 py-0.5">{shortTag(user.teamName)}</span>
                <span className="font-semibold">{(Math.random() * 50 + 100).toFixed(1)}</span>
                <span className="opacity-60">@</span>
                <span className="font-mono bg-gray-800 rounded px-1.5 py-0.5">{shortTag(league.users[(i+1) % league.users.length].teamName)}</span>
                <span className="font-semibold">{(Math.random() * 50 + 100).toFixed(1)}</span>
                <span className="ml-2 text-[10px] uppercase tracking-wide opacity-70">LIVE</span>
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      </div>

      {/* Headlines Rail */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start gap-3 p-3 rounded-xl border hover:shadow-sm">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase">PREVIEW</span>
            <div className="min-w-0">
              <div className="font-extrabold leading-snug truncate">Week 18: Championship Round</div>
              <div className="text-xs text-gray-600 truncate">Who will claim the title?</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl border hover:shadow-sm">
            <span className="bg-green-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase">CHAT</span>
            <div className="min-w-0">
              <div className="font-extrabold leading-snug truncate">League Chat is Live</div>
              <div className="text-xs text-gray-600 truncate">{totalBets > 0 ? `${totalBets} messages` : 'Start the conversation'}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl border hover:shadow-sm">
            <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase">BETTING</span>
            <div className="min-w-0">
              <div className="font-extrabold leading-snug truncate">FAAB Sportsbook Open</div>
              <div className="text-xs text-gray-600 truncate">{totalBets} bets placed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Column */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Featured Hero */}
            <div className="relative h-80 sm:h-96 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b2a5b] via-blue-800 to-indigo-900 shadow-xl">
              <div className="absolute inset-0 bg-[url('/grid-noise.png')] opacity-20" />
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative z-10 h-full p-6 sm:p-8 flex flex-col justify-end">
                <span className="inline-flex items-center gap-1 bg-red-600/90 text-white text-[10px] font-black px-2 py-1 rounded w-fit uppercase mb-2">
                  <Play className="h-3 w-3" /> Game of the Week
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  {rivalry ? `${rivalry.a.teamName} vs ${rivalry.b.teamName}` : 'Championship Week'}
                </h1>
                <p className="text-gray-200 mt-2 text-sm sm:text-base max-w-2xl">
                  {rivalry ? `${rivalry.a.ownerName} takes on ${rivalry.b.ownerName} in what could be the matchup of the week.` : 'The ultimate test awaits in the championship round.'}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <Link href={`/debug/league/${subdomain}/chat`} className="inline-flex items-center gap-1.5 rounded-full bg-white text-black text-xs font-bold px-3 py-1.5">
                    Join Chat <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="#" className="text-white/90 underline underline-offset-4 text-xs">View matchup</Link>
                </div>
              </div>
            </div>

            {/* What's Live */}
            <section>
              <SectionTitle title="WHAT'S LIVE" badge="LIVE" href="/live" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex gap-2 mb-2">
                      <span className="bg-blue-600 text-[10px] font-black px-1.5 py-0.5 rounded">LIVE</span>
                      <span className="bg-red-600 text-[10px] font-black px-1.5 py-0.5 rounded">CHAT</span>
                    </div>
                    <h4 className="font-extrabold text-lg leading-tight">League Chat & Forums</h4>
                    <p className="text-xs text-white/85 mt-1">Real-time messaging and discussion threads for your league.</p>
                  </div>
                </div>
                <div className="rounded-2xl p-6 min-h-[220px] text-white bg-gradient-to-br from-purple-700 to-blue-700 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded uppercase">Featured</span>
                    <span className="text-xs opacity-80">Betting</span>
                  </div>
                  <h4 className="text-xl font-extrabold">FAAB Sportsbook</h4>
                  <p className="text-xs sm:text-sm text-white/90 mt-1">Place bets using your FAAB budget on weekly matchups.</p>
                </div>
              </div>
            </section>

            {/* Trending Players */}
            <section>
              <SectionTitle title="League Activity" href="/trending" />
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-900 px-3 py-1.5 rounded-full text-xs font-semibold">
                  <Flame className="h-4 w-4 text-orange-600" /> Chat Messages
                  <span className="text-xs text-gray-500">{totalBets}</span>
                </span>
                <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-900 px-3 py-1.5 rounded-full text-xs font-semibold">
                  <Flame className="h-4 w-4 text-green-600" /> Active Bettors
                  <span className="text-xs text-gray-500">{activeBettors}</span>
                </span>
                <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-900 px-3 py-1.5 rounded-full text-xs font-semibold">
                  <Flame className="h-4 w-4 text-blue-600" /> League Members
                  <span className="text-xs text-gray-500">{league.users.length}</span>
                </span>
              </div>
            </section>

            {/* Matchup Preview Section */}
            <section>
              <SectionTitle title="MATCHUP PREVIEW" badge="NEW" href="/matchups" />
              <FantasyMatchupPreview matchupData={{
                matchup_id: "preview-1",
                week: 18,
                team_a: {
                  team_id: league.users[0]?.id || "team1",
                  team_name: league.users[0]?.teamName || "Team Alpha",
                  owner_name: league.users[0]?.ownerName || "Owner A",
                  record: "10-3",
                  projected_total: 142.3,
                  key_players: [
                    {
                      player_id: "player1",
                      name: "Josh Jacobs",
                      position: "RB",
                      team: "LV",
                      opponent_rank: 28,
                      projected_points: 18.4,
                      floor: 12.1,
                      ceiling: 26.8,
                      recent_form: [16.2, 22.1, 14.8, 19.3],
                      matchup_grade: "A",
                      start_sit: "MUST_START",
                      key_factors: ["Weak run defense", "High red zone usage", "Positive game script"]
                    },
                    {
                      player_id: "player2",
                      name: "Davante Adams",
                      position: "WR",
                      team: "LV",
                      projected_points: 15.7,
                      floor: 8.4,
                      ceiling: 24.1,
                      recent_form: [12.3, 18.7, 9.2, 21.4],
                      matchup_grade: "B",
                      start_sit: "START",
                      key_factors: ["Target share increase", "Slot coverage weakness"]
                    }
                  ],
                  lineup_decisions: [
                    {
                      position: "FLEX",
                      options: [
                        {
                          player: "Courtland Sutton",
                          recommendation: "Start",
                          reasoning: "Favorable target share vs weak secondary"
                        },
                        {
                          player: "Tony Pollard",
                          recommendation: "Bench",
                          reasoning: "Tough matchup vs elite run defense"
                        }
                      ],
                      suggested_play: "Courtland Sutton"
                    }
                  ],
                  advantages: [
                    "Superior QB play advantage",
                    "Favorable defensive matchups at WR",
                    "Strong recent form trending up"
                  ],
                  concerns: [
                    "Injury concerns at TE position",
                    "Defense facing high-powered offense"
                  ]
                },
                team_b: {
                  team_id: league.users[1]?.id || "team2",
                  team_name: league.users[1]?.teamName || "Team Beta",
                  owner_name: league.users[1]?.ownerName || "Owner B",
                  record: "9-4",
                  projected_total: 138.7,
                  key_players: [
                    {
                      player_id: "player3",
                      name: "Christian McCaffrey",
                      position: "RB",
                      team: "SF",
                      projected_points: 22.1,
                      floor: 15.8,
                      ceiling: 29.4,
                      recent_form: [24.2, 18.9, 20.7, 26.3],
                      matchup_grade: "A",
                      start_sit: "MUST_START",
                      key_factors: ["Workhorse role", "Red zone dominance", "Pass-catching upside"]
                    }
                  ],
                  lineup_decisions: [],
                  advantages: [
                    "Elite RB1 with safe floor",
                    "Strong pass-catching backs"
                  ],
                  concerns: [
                    "QB inconsistency",
                    "Tough WR matchups"
                  ]
                },
                key_storylines: [
                  "Battle of contrasting styles - high-volume passing vs ground control",
                  "Playoff seeding implications with potential bye week on the line",
                  "Head-to-head season series tied 1-1, rubber match for bragging rights"
                ],
                injury_watch: [
                  "Monitor Davante Adams (ankle) - practiced limited Wednesday",
                  "Christian McCaffrey (rest) - expected to play but snap count uncertain"
                ],
                waiver_implications: [
                  "Handcuff lottery - Jordan Mason trending up if CMC sits",
                  "Weather concerns may boost slot receivers"
                ],
                stack_opportunities: [
                  {
                    type: "QB_WR",
                    players: ["Derek Carr", "Davante Adams"],
                    correlation: 0.73,
                    upside: "High ceiling combo with red zone connection",
                    risk: "Both players face tough matchup, correlated bust potential"
                  }
                ]
              }} />
            </section>

            {/* Matchup Recap Section */}
            <section>
              <SectionTitle title="LAST WEEK'S RECAP" badge="ANALYSIS" href="/recaps" />
              <PremiumMatchupRecap recapData={{
                matchup_id: "recap-1",
                week: 17,
                game_state: "completed",
                headline: `${league.users[0]?.teamName || "Team Alpha"} Survives Wild Shootout`,
                subheading: "135.4-132.8 thriller decided by Monday night heroics",
                narrative_framework: "back_and_forth_thriller",
                winner: {
                  name: league.users[0]?.teamName || "Team Alpha",
                  owner: league.users[0]?.ownerName || "Owner A",
                  score: 135.4,
                  projected_score: 142.3,
                  record: "10-3",
                  new_power_ranking: 3,
                  season_narrative: {
                    trajectory: "ascending",
                    momentum_shift: true,
                    power_ranking_movement: 2,
                    season_defining_moment: true,
                    championship_implications: "Clinched playoff berth, fighting for bye week"
                  },
                  team_analytics: {
                    efficiency_metrics: {
                      projection_accuracy: 87.2,
                      consistency_score: 73.4,
                      ceiling_realization: 82.1,
                      floor_protection: 91.3
                    },
                    contextual_performance: {
                      vs_expectation: 95.2,
                      roster_utilization: 88.7,
                      strategic_execution: 79.4
                    }
                  },
                  key_performers: [
                    {
                      name: "Lamar Jackson",
                      position: "QB",
                      projected: 24.1,
                      actual: 31.8,
                      variance_percentage: 31.9,
                      context: "3 passing TDs, 1 rushing TD in comeback performance",
                      performance_tier: "elite",
                      narrative_significance: "Clutch fourth quarter drives sealed the victory"
                    },
                    {
                      name: "Tyreek Hill",
                      position: "WR",
                      projected: 18.3,
                      actual: 26.4,
                      variance_percentage: 44.3,
                      context: "8 catches, 124 yards, 2 TDs including game-winner",
                      performance_tier: "elite",
                      narrative_significance: "Monday night magic with 4th quarter touchdown catch"
                    }
                  ]
                },
                loser: {
                  name: league.users[1]?.teamName || "Team Beta",
                  owner: league.users[1]?.ownerName || "Owner B",
                  score: 132.8,
                  projected_score: 138.7,
                  record: "9-4",
                  new_power_ranking: 5,
                  season_narrative: {
                    trajectory: "plateauing",
                    momentum_shift: false,
                    power_ranking_movement: -1,
                    season_defining_moment: false,
                    championship_implications: "Still in playoff hunt but seeding concerns"
                  },
                  team_analytics: {
                    efficiency_metrics: {
                      projection_accuracy: 78.4,
                      consistency_score: 82.1,
                      ceiling_realization: 71.3,
                      floor_protection: 85.7
                    },
                    contextual_performance: {
                      vs_expectation: 95.8,
                      roster_utilization: 91.2,
                      strategic_execution: 83.6
                    }
                  },
                  disappointing_performers: [
                    {
                      name: "Jonathan Taylor",
                      position: "RB",
                      projected: 19.7,
                      actual: 8.3,
                      variance_percentage: -57.9,
                      context: "Limited carries due to negative game script",
                      performance_tier: "disappointing",
                      narrative_significance: "Game flow eliminated rushing attack early"
                    }
                  ]
                },
                game_flow: {
                  turning_points: [
                    {
                      player: "Tyreek Hill",
                      moment: "4th quarter 12-yard TD catch",
                      impact: "Gave winning team the lead with 3:47 remaining",
                      swing_value: 12.8
                    },
                    {
                      player: "Lamar Jackson",
                      moment: "3rd quarter 18-yard rushing TD",
                      impact: "Momentum shift after trailing by 14",
                      swing_value: 8.4
                    }
                  ],
                  momentum_shifts: 4,
                  lead_changes: 6
                },
                statistical_storylines: [
                  {
                    type: "record_breaking",
                    headline: "Highest-Scoring Matchup of Season",
                    data_point: "268.2 combined points",
                    significance: "Broke previous season high by 31.4 points",
                    broader_implications: "Both teams peaking at right time for playoffs"
                  },
                  {
                    type: "historical_context",
                    headline: "Monday Night Thriller",
                    data_point: "Game decided by final MNF performance",
                    significance: "Third time this season a matchup was decided on Monday",
                    broader_implications: "Shows depth and strategic roster construction"
                  }
                ],
                expert_analysis: {
                  key_tactical_decisions: [
                    "Starting Lamar Jackson over backup QB paid off in clutch time",
                    "Benching underperforming WR3 for hot waiver pickup was crucial",
                    "Defense/ST stream hit perfectly against struggling offense"
                  ],
                  what_if_scenarios: [
                    {
                      scenario: "If Jonathan Taylor had reached projection",
                      impact: "Loser would have won by 3.4 points, complete outcome flip"
                    },
                    {
                      scenario: "If weather had impacted Monday night game",
                      impact: "Ground game emphasis might have favored different roster construction"
                    }
                  ],
                  season_implications: [
                    "Winner now controls own playoff destiny",
                    "Loser needs help in final week to secure favorable seeding",
                    "Head-to-head tiebreaker could be crucial in final standings"
                  ]
                },
                next_week_preview: {
                  winner_opponent: league.users[2]?.teamName || "Team Gamma",
                  winner_storyline: "Championship week showdown vs division rival",
                  winner_win_probability: 67.3,
                  loser_opponent: league.users[3]?.teamName || "Team Delta",
                  loser_storyline: "Must-win game to stay alive in playoff race",
                  loser_win_probability: 58.9
                }
              }} />
            </section>

            {/* Rivalry Card */}
            {rivalry && (
              <section>
                <SectionTitle title="Featured Matchup" href="/rivalries" />
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="md:col-span-2 p-6 bg-white">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Trophy className="h-4 w-4 text-amber-500" /> 
                        Season Matchup • Week 18
                      </div>
                      <h3 className="text-2xl font-extrabold mt-2">
                        {rivalry.a.teamName} ({spread >= 0 ? `-${Math.abs(spread)}` : `+${Math.abs(spread)}`}) vs {rivalry.b.teamName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {rivalry.a.ownerName} vs {rivalry.b.ownerName} • Upset chance: {upsetChance}%
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-[10px] uppercase font-black bg-blue-600 text-white rounded px-2 py-1">Feature</span>
                        <span className="text-[10px] uppercase font-black bg-gray-900 text-white rounded px-2 py-1">Preview</span>
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50 flex flex-col justify-center gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Spread</span>
                        <span className="font-bold">{spread >= 0 ? `-${Math.abs(spread)}` : `+${Math.abs(spread)}`}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">O/U</span>
                        <span className="font-bold">{ou}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Upset %</span>
                        <span className="font-bold">{upsetChance}%</span>
                      </div>
                      <Link href={`/debug/league/${subdomain}/chat`} className="mt-3 inline-flex items-center gap-2 text-blue-700 font-semibold hover:underline">
                        Discuss <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* League Stats */}
            <section>
              <SectionTitle title="League Stats" />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Teams</span>
                  <span className="font-bold">{league.users.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Season</span>
                  <span className="font-bold">{sleeperLeague.season}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Commissioner</span>
                  <span className="font-bold truncate ml-2">{league.commissioner.name}</span>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <SectionTitle title="Quick Actions" />
              <div className="space-y-2">
                <Link href={`/debug/league/${subdomain}/chat`} className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded text-sm font-semibold">
                  💬 Open Chat
                </Link>
                <div className="block w-full">
                  <DebugActions subdomain={subdomain} />
                </div>
              </div>
            </section>

            {/* Team List */}
            <section>
              <SectionTitle title="Teams" href="/teams" />
              <div className="space-y-2">
                {league.users.slice(0, 8).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded text-sm">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{user.teamName}</div>
                      <div className="text-xs text-gray-500 truncate">{user.ownerName}</div>
                    </div>
                    {user.sleeperUsername && (
                      <span className="text-xs text-green-600 font-mono">@{user.sleeperUsername}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
