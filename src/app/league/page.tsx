import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const prisma = new PrismaClient()

interface LeaguePageProps {
  searchParams: { subdomain: string }
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

export default async function LeaguePage({ searchParams }: LeaguePageProps) {
  const { subdomain } = searchParams
  
  if (!subdomain) {
    notFound()
  }
  
  const data = await getLeagueData(subdomain)
  
  if (!data) {
    notFound()
  }
  
  const { league, sleeperLeague, rosters, users } = data
  
  // Calculate league stats
  const totalBets = league.matchups.reduce((acc, matchup) => acc + matchup.bets.length, 0)
  const activeBettors = new Set(league.matchups.flatMap(m => m.bets.map(b => b.userId))).size
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{league.name}</h1>
              <p className="text-sm text-slate-400">{sleeperLeague.season} Season</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-blue-600 text-blue-400">
                {sleeperLeague.total_rosters} Teams
              </Badge>
              {league.isPremium && (
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  Premium
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            <Link href="/" className="flex-shrink-0 text-blue-400 font-medium border-b-2 border-blue-400 pb-2">
              Home
            </Link>
            <Link href="/matchups" className="flex-shrink-0 text-slate-300 hover:text-white pb-2">
              Matchups
            </Link>
            <Link href="/standings" className="flex-shrink-0 text-slate-300 hover:text-white pb-2">
              Standings
            </Link>
            <Link href="/betting" className="flex-shrink-0 text-slate-300 hover:text-white pb-2">
              Betting
            </Link>
            <Link href="/chat" className="flex-shrink-0 text-slate-300 hover:text-white pb-2">
              Chat
            </Link>
            <Link href="/rivalries" className="flex-shrink-0 text-slate-300 hover:text-white pb-2">
              Rivalries
            </Link>
            <Link href="/rankings" className="flex-shrink-0 text-slate-300 hover:text-white pb-2">
              Rankings
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Welcome to {league.name}
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Your premium fantasy football hub with advanced analytics, matchup previews, and FAAB betting.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">League Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400 mb-1">{totalBets}</div>
              <div className="text-sm text-slate-400">Total Bets Placed</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Participation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-1">{activeBettors}</div>
              <div className="text-sm text-slate-400">Active Bettors</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Season</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400 mb-1">Week {sleeperLeague.leg || 18}</div>
              <div className="text-sm text-slate-400">{sleeperLeague.season} Season</div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">This Week's Matchups</CardTitle>
              <CardDescription className="text-slate-400">
                Premium analysis and betting lines for all matchups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {league.matchups.slice(0, 3).map((matchup) => (
                  <div key={matchup.id} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                    <div className="text-sm">
                      <div className="text-white font-medium">{matchup.teamAName} vs {matchup.teamBName}</div>
                      <div className="text-slate-400">Spread: {matchup.spread > 0 ? '+' : ''}{matchup.spread}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-300">O/U: {matchup.overUnder}</div>
                      <div className="text-xs text-slate-400">{matchup.bets.length} bets</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-600">
                <Link href="/matchups" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  View All Matchups →
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">League Features</CardTitle>
              <CardDescription className="text-slate-400">
                Everything you need for an engaging fantasy season
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-slate-300">FAAB Sportsbook</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-slate-300">Premium Matchup Analysis</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  <span className="text-slate-300">Rivalry Tracking</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                  <span className="text-slate-300">Playoff Odds</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commissioner Info */}
        <div className="mt-12 text-center">
          <p className="text-slate-400">
            League managed by <span className="text-white font-medium">{league.commissioner.name}</span>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-slate-400">
            <p>&copy; 2025 Fantasy Football Hub. Powered by premium analytics.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
