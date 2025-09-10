'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface League {
  id: string
  name: string
  subdomain: string
  sleeperLeagueId: string
  isActive: boolean
  isPremium: boolean
  commissioner: {
    name: string
    email: string
  }
  stats: {
    users: number
    matchups: number
    chatMessages: number
    forumThreads: number
  }
  debugUrl: string
  chatUrl: string
  createdAt: string
}

export default function DebugDashboard() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/debug/leagues')
        const data = await response.json()
        
        if (response.ok) {
          setLeagues(data.leagues)
        } else {
          setError(data.error || 'Failed to fetch leagues')
        }
      } catch (err) {
        setError('Network error fetching leagues')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeagues()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading leagues...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Fantasy Hub Debug Dashboard</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Test and debug your fantasy football leagues
          </p>
          <Badge className="bg-yellow-600 text-white mt-4">DEBUG MODE</Badge>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-white font-semibold mb-2">Create New League</h3>
              <Link href="/onboard">
                <Button className="bg-blue-600 hover:bg-blue-700">Go to Onboarding</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-white font-semibold mb-2">Total Leagues</h3>
              <div className="text-3xl font-bold text-blue-400">{leagues.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-white font-semibold mb-2">Database Browser</h3>
              <a href="http://localhost:5555" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  Open Prisma Studio
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-900 border-red-700 mb-8">
            <CardContent className="p-6">
              <p className="text-red-200">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Leagues List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Available Leagues</CardTitle>
            <CardDescription className="text-slate-400">
              Click on any league to test the functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leagues.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-4">No leagues found in the database.</p>
                <p className="text-slate-500 text-sm mb-6">
                  Create a league through the onboarding process first.
                </p>
                <Link href="/onboard">
                  <Button className="bg-blue-600 hover:bg-blue-700">Create Your First League</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {leagues.map((league) => (
                  <div key={league.id} className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                    {/* League Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-2xl font-bold text-white">{league.name}</h3>
                          <Badge variant={league.isActive ? 'default' : 'destructive'}>
                            {league.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {league.isPremium && (
                            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                              Premium
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-300 font-mono text-sm">{league.subdomain}</p>
                      </div>
                    </div>

                    {/* League Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div>
                        <div className="text-slate-400 text-sm">Commissioner</div>
                        <div className="text-white font-medium">{league.commissioner.name}</div>
                        <div className="text-slate-500 text-xs">{league.commissioner.email}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm">Sleeper League</div>
                        <div className="text-white font-mono text-xs">{league.sleeperLeagueId}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm">Users</div>
                        <div className="text-white">{league.stats.users} teams</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm">Activity</div>
                        <div className="text-white">{league.stats.chatMessages} messages</div>
                        <div className="text-slate-400 text-xs">{league.stats.forumThreads} threads</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Link href={league.debugUrl}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          🏠 League Home
                        </Button>
                      </Link>
                      
                      <Link href={league.chatUrl}>
                        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-600">
                          💬 Chat & Forums
                        </Button>
                      </Link>

                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/forum/${league.subdomain}/init`, { method: 'POST' })
                            if (response.ok) {
                              alert('Forum threads initialized for ' + league.name)
                            } else {
                              alert('Error initializing forums')
                            }
                          } catch (error) {
                            alert('Error: ' + error)
                          }
                        }}
                        className="border-slate-600 text-slate-300 hover:bg-slate-600"
                      >
                        🚀 Init Forums
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const url = `https://${league.subdomain}.fantasyhub.com`
                          navigator.clipboard.writeText(url)
                          alert(`Copied production URL: ${url}`)
                        }}
                        className="border-slate-600 text-slate-300 hover:bg-slate-600"
                      >
                        📋 Copy Production URL
                      </Button>
                    </div>

                    {/* Debug Info */}
                    <div className="mt-4 p-3 bg-slate-800 rounded text-xs text-slate-400">
                      <strong>Debug URLs:</strong><br/>
                      League Home: <code>http://localhost:3000{league.debugUrl}</code><br/>
                      Chat: <code>http://localhost:3000{league.chatUrl}</code><br/>
                      Production: <code>https://{league.subdomain}.fantasyhub.com</code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-900 border-blue-700 mt-8">
          <CardHeader>
            <CardTitle className="text-blue-200">Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-100">
            <ol className="list-decimal list-inside space-y-2">
              <li>Click "League Home" to test the main league dashboard</li>
              <li>Click "Chat & Forums" to test the real-time chat and forum system</li>
              <li>Click "Init Forums" to create sample forum threads for testing</li>
              <li>Use any Sleeper username to sign into chat (it doesn't need to be real)</li>
              <li>Open multiple browser tabs to test real-time chat between users</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
