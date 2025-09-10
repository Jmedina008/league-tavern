import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CreateLeagueRequest {
  commissioner: {
    name: string
    email: string
  }
  league: {
    sleeperLeagueId: string
    name: string
    subdomain: string
    customDomain?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateLeagueRequest = await request.json()
    
    // Validate required fields
    if (!body.commissioner?.name || !body.commissioner?.email) {
      return NextResponse.json(
        { error: 'Commissioner name and email are required' },
        { status: 400 }
      )
    }
    
    if (!body.league?.sleeperLeagueId || !body.league?.name || !body.league?.subdomain) {
      return NextResponse.json(
        { error: 'League ID, name, and subdomain are required' },
        { status: 400 }
      )
    }
    
    // Verify Sleeper league exists
    try {
      const sleeperResponse = await fetch(`https://api.sleeper.app/v1/league/${body.league.sleeperLeagueId}`)
      if (!sleeperResponse.ok) {
        return NextResponse.json(
          { error: 'Sleeper league not found' },
          { status: 400 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Unable to verify Sleeper league' },
        { status: 400 }
      )
    }
    
    // Check if league already exists
    const existingLeague = await prisma.league.findUnique({
      where: { sleeperLeagueId: body.league.sleeperLeagueId }
    })
    
    if (existingLeague) {
      return NextResponse.json(
        { error: 'This league is already registered' },
        { status: 400 }
      )
    }
    
    // Check if subdomain is available
    const existingSubdomain = await prisma.league.findUnique({
      where: { subdomain: body.league.subdomain }
    })
    
    if (existingSubdomain) {
      return NextResponse.json(
        { error: 'Subdomain is already taken' },
        { status: 400 }
      )
    }
    
    // Create or find commissioner
    let commissioner = await prisma.commissioner.findUnique({
      where: { email: body.commissioner.email }
    })
    
    if (!commissioner) {
      commissioner = await prisma.commissioner.create({
        data: {
          name: body.commissioner.name,
          email: body.commissioner.email
        }
      })
    }
    
    // Create league
    const league = await prisma.league.create({
      data: {
        sleeperLeagueId: body.league.sleeperLeagueId,
        name: body.league.name,
        subdomain: body.league.subdomain,
        customDomain: body.league.customDomain,
        commissionerId: commissioner.id
      }
    })
    
    // Import league users from Sleeper
    try {
      const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${body.league.sleeperLeagueId}/rosters`)
      const usersResponse = await fetch(`https://api.sleeper.app/v1/league/${body.league.sleeperLeagueId}/users`)
      
      if (rostersResponse.ok && usersResponse.ok) {
        const rosters = await rostersResponse.json()
        const users = await usersResponse.json()
        
        // Create user records
        for (const roster of rosters) {
          const user = users.find((u: any) => u.user_id === roster.owner_id)
          if (user) {
            await prisma.user.create({
              data: {
                leagueId: league.id,
                rosterId: roster.roster_id,
                teamName: roster.metadata?.team_name || user.metadata?.team_name || `Team ${roster.roster_id}`,
                ownerName: user.display_name || user.username || 'Unknown',
                faabBalance: 100 // Starting FAAB balance
              }
            })
          }
        }
      }
    } catch (error) {
      console.error('Error importing league users:', error)
      // Don't fail the league creation if user import fails
    }
    
    return NextResponse.json({
      success: true,
      league: {
        id: league.id,
        name: league.name,
        subdomain: league.subdomain,
        url: `https://${league.subdomain}.fantasyhub.com`
      },
      commissioner: {
        id: commissioner.id,
        name: commissioner.name,
        email: commissioner.email
      }
    })
    
  } catch (error) {
    console.error('Error creating league:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
