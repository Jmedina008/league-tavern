import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { subdomain, sleeperUsername } = await request.json()
    
    if (!subdomain || !sleeperUsername) {
      return NextResponse.json(
        { error: 'Subdomain and Sleeper username are required' },
        { status: 400 }
      )
    }
    
    // Find the league
    const league = await prisma.league.findUnique({
      where: { subdomain },
      include: { users: true }
    })
    
    if (!league) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      )
    }
    
    // Find or create user by Sleeper username
    let user = await prisma.user.findFirst({
      where: {
        leagueId: league.id,
        sleeperUsername: sleeperUsername
      }
    })
    
    // If not found by sleeperUsername, try to match by existing user and update
    if (!user) {
      // Check if there's a user without sleeperUsername that might match
      const usersWithoutSleeper = await prisma.user.findMany({
        where: {
          leagueId: league.id,
          sleeperUsername: null
        }
      })
      
      // For MVP, let them pick any available user slot
      if (usersWithoutSleeper.length > 0) {
        user = await prisma.user.update({
          where: { id: usersWithoutSleeper[0].id },
          data: { 
            sleeperUsername: sleeperUsername,
            isOnline: true,
            lastSeen: new Date()
          }
        })
      } else {
        // Create a new user if none available (shouldn't happen in normal flow)
        user = await prisma.user.create({
          data: {
            leagueId: league.id,
            rosterId: 999, // Temporary roster ID for chat-only users
            teamName: `${sleeperUsername}'s Team`,
            ownerName: sleeperUsername,
            sleeperUsername: sleeperUsername,
            isOnline: true,
            lastSeen: new Date()
          }
        })
      }
    } else {
      // Update existing user's online status
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          isOnline: true,
          lastSeen: new Date()
        }
      })
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        teamName: user.teamName,
        ownerName: user.ownerName,
        sleeperUsername: user.sleeperUsername,
        isOnline: user.isOnline
      }
    })
    
  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
