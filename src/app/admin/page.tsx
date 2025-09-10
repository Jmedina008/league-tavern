import Link from "next/link"
import { ArrowLeft, Settings, Download, Users, DollarSign, TrendingUp } from "lucide-react"
import { prisma, getWeekBets, generateFAABAdjustmentReport, syncUsersFromSleeper } from "../../../lib/db"

export const revalidate = 30 // Refresh every 30 seconds

const SLEEPER = "https://api.sleeper.app/v1"
const LEAGUE_ID = process.env.LEAGUE_ID || "1180507846524702720"

async function sx(path: string) { 
  const r = await fetch(`${SLEEPER}${path}`, { next: { revalidate: 30 } })
  if (!r.ok) throw new Error(`Sleeper fetch failed: ${path}`)
  return r.json() 
}

async function getState() { return sx(`/state/nfl`) }
async function getUsers(leagueId: string) { return sx(`/league/${leagueId}/users`) }
async function getRosters(leagueId: string) { return sx(`/league/${leagueId}/rosters`) }

export default async function AdminDashboard() {
  try {
    const state = await getState().catch(() => ({ week: 1 }))
    const week = Number(state?.week || 1)

    // Skip Sleeper sync during build time (no league context)
    let dbUsers: any[] = []
    let weekBets: any[] = []
    let adjustments: any[] = []
    
    try {
      // Get betting data
      const results = await Promise.all([
        prisma.user.findMany({
          include: {
            bets: { where: { status: 'PENDING' } },
            transactions: {
              where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
              orderBy: { createdAt: 'desc' }
            }
          }
        }).catch(() => []),
        getWeekBets(week).catch(() => []),
        generateFAABAdjustmentReport(week).catch(() => [])
      ])
      
      dbUsers = results[0]
      weekBets = results[1] 
      adjustments = results[2]
    } catch (error) {
      console.warn('Database operations failed during build, using empty data')
      dbUsers = []
      weekBets = []
      adjustments = []
    }

    const totalFAAB = dbUsers.reduce((sum, user) => sum + user.faabBalance, 0)
    const totalBets = weekBets.length
    const activeBets = weekBets.filter(bet => bet.status === 'PENDING').length
    const totalWagered = weekBets.reduce((sum, bet) => sum + bet.stake, 0)

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
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Commissioner Dashboard</h1>
                <p className="text-gray-600 mt-1">Betting system management and FAAB adjustments</p>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalFAAB}</div>
                  <div className="text-sm text-gray-600">Total FAAB</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalBets}</div>
                  <div className="text-sm text-gray-600">Total Bets</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{activeBets}</div>
                  <div className="text-sm text-gray-600">Active Bets</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalWagered}</div>
                  <div className="text-sm text-gray-600">Total Wagered</div>
                </div>
              </div>
            </div>
          </div>

          {/* FAAB Balances */}
          <div className="bg-white rounded-2xl border p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">FAAB Balances</h2>
              <Link 
                href="/admin/export-faab"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Adjustments
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Team</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Owner</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">FAAB Balance</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Pending Bets</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">This Week</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dbUsers.length > 0 ? dbUsers.map((user) => {
                    const weekTransactions = user.transactions?.filter(t => 
                      t.createdAt.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                    ) || []
                    const weekActivity = weekTransactions.reduce((sum, t) => sum + t.amount, 0)
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{user.teamName}</td>
                        <td className="px-4 py-3 text-gray-600">{user.ownerName}</td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${user.faabBalance < 20 ? 'text-red-600' : 'text-gray-900'}`}>
                            ${user.faabBalance}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{user.bets?.length || 0} bets</td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${
                            weekActivity > 0 ? 'text-green-600' : weekActivity < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {weekActivity > 0 ? '+' : ''}{weekActivity}
                          </span>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No users found. Create a league first to see FAAB balances.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Bets */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Week {week} Bets</h2>
            
            {weekBets.length > 0 ? (
              <div className="space-y-4">
                {weekBets.slice(0, 10).map((bet) => (
                  <div key={bet.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                        {bet.user.teamName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{bet.user.teamName}</div>
                        <div className="text-sm text-gray-600">
                          {bet.betType} - {bet.selection} ({bet.odds})
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${bet.stake}</div>
                      <div className={`text-sm ${
                        bet.status === 'PENDING' ? 'text-yellow-600' :
                        bet.status === 'WON' ? 'text-green-600' :
                        bet.status === 'LOST' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {bet.status}
                      </div>
                    </div>
                  </div>
                ))}
                
                {weekBets.length > 10 && (
                  <div className="text-center pt-4">
                    <span className="text-gray-500">And {weekBets.length - 10} more bets...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No bets placed this week yet.
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-2xl border p-6">
            <h3 className="font-bold text-gray-900 mb-4">Commissioner Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href="/admin/settle-bets"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-semibold text-gray-900">Settle Bets</h4>
                <p className="text-sm text-gray-600 mt-1">Manually settle completed matchups</p>
              </Link>
              
              <Link 
                href="/admin/faab-adjustments"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-semibold text-gray-900">FAAB Adjustments</h4>
                <p className="text-sm text-gray-600 mt-1">Make manual FAAB balance corrections</p>
              </Link>
              
              <Link 
                href="/admin/betting-history"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-semibold text-gray-900">Betting History</h4>
                <p className="text-sm text-gray-600 mt-1">View complete betting transaction log</p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading admin dashboard:', error)
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to load dashboard</h1>
            <p className="text-gray-600 mb-6">There was an issue loading the betting system data.</p>
            <Link href="/" className="text-blue-700 font-semibold hover:underline">
              ← Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
