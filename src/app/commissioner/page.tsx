'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import Link from 'next/link'

interface League {
  id: string
  name: string
  subdomain: string
  customDomain?: string
  sleeperLeagueId: string
  season: number
  isActive: boolean
  isPremium: boolean
  createdAt: string
  _count: {
    users: number
    matchups: number
  }
}

interface Commissioner {
  id: string
  name: string
  email: string
  leagues: League[]
}

export default function CommissionerDashboard() {
  const [commissioner, setCommissioner] = useState<Commissioner | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // For now, we'll simulate loading commissioner data
    // In a real app, this would be fetched based on authentication
    const loadCommissioner = () => {
      // Simulate loading
      setTimeout(() => {
        setCommissioner({
          id: 'comm1',
          name: 'John Commissioner',
          email: 'john@example.com',
          leagues: [
            {
              id: 'league1',
              name: 'The Championship League',
              subdomain: 'championship-league',
              sleeperLeagueId: '1180507846524702720',
              season: 2025,
              isActive: true,
              isPremium: true,
              createdAt: '2025-01-07T05:34:44Z',
              _count: {
                users: 12,
                matchups: 15
              }
            }
          ]
        })
        setLoading(false)
      }, 1000)
    }

    loadCommissioner()
  }, [])

  const toggleLeagueStatus = async (leagueId: string, isActive: boolean) => {
    try {
      setError('')
      // In a real app, this would make an API call
      // await fetch(`/api/leagues/${leagueId}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ isActive: !isActive })
      // })
      
      setCommissioner(prev => {
        if (!prev) return prev
        return {
          ...prev,
          leagues: prev.leagues.map(league =>
            league.id === leagueId
              ? { ...league, isActive: !isActive }
              : league
          )
        }
      })
    } catch (err) {
      setError('Failed to update league status')
    }
  }

  const syncLeagueData = async (leagueId: string) => {
    try {
      setError('')
      // In a real app, this would make an API call to sync Sleeper data
      console.log('Syncing league data for:', leagueId)
      // Simulate success
      alert('League data synced successfully!')
    } catch (err) {
      setError('Failed to sync league data')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!commissioner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-slate-400 mb-6">You need to be authenticated as a commissioner to access this page.</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/landing">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Commissioner Dashboard</h1>
          <p className="text-slate-400">Manage your fantasy football leagues</p>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-900 border-red-700 text-red-200">
            {error}
          </Alert>
        )}

        {/* Commissioner Info */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <Input
                  value={commissioner.name}
                  readOnly
                  className="bg-slate-700 border-slate-600 text-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <Input
                  value={commissioner.email}
                  readOnly
                  className="bg-slate-700 border-slate-600 text-slate-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">{commissioner.leagues.length}</div>
                <div className="text-sm text-slate-400">Active Leagues</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {commissioner.leagues.reduce((acc, league) => acc + league._count.users, 0)}
                </div>
                <div className="text-sm text-slate-400">Total Users</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="text-center">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 w-full">
                  <Link href="/onboard">Create New League</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leagues */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Your Leagues</CardTitle>
            <CardDescription className="text-slate-400">
              Manage and monitor your fantasy football leagues
            </CardDescription>
          </CardHeader>
          <CardContent>
            {commissioner.leagues.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-4">You haven't created any leagues yet.</p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/onboard">Create Your First League</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {commissioner.leagues.map((league) => (
                  <div key={league.id} className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{league.name}</h3>
                          {league.isPremium && (
                            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                              Premium
                            </Badge>
                          )}
                          <Badge variant={league.isActive ? "default" : "destructive"} className="text-xs">
                            {league.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">
                          {league._count.users} teams • {league.season} season
                        </p>
                        <p className="text-slate-300 text-sm font-mono">
                          https://{league.subdomain}.fantasyhub.com
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://${league.subdomain}.fantasyhub.com`, '_blank')}
                          className="border-slate-600 text-slate-300 hover:bg-slate-600"
                        >
                          Visit Site
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => syncLeagueData(league.id)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-600"
                        >
                          Sync Data
                        </Button>
                        <Button
                          size="sm"
                          variant={league.isActive ? "destructive" : "default"}
                          onClick={() => toggleLeagueStatus(league.id, league.isActive)}
                        >
                          {league.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-slate-400">Sleeper ID</div>
                        <div className="text-white font-mono text-xs">{league.sleeperLeagueId}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Created</div>
                        <div className="text-white">{new Date(league.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Matchups</div>
                        <div className="text-white">{league._count.matchups}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Status</div>
                        <div className={league.isActive ? 'text-green-400' : 'text-red-400'}>
                          {league.isActive ? 'Running' : 'Paused'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
