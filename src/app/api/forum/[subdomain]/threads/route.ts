import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    const { subdomain } = params
    
    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      )
    }
    
    // Find the league
    const league = await prisma.league.findUnique({
      where: { subdomain }
    })
    
    if (!league) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      )
    }
    
    const threads = await prisma.forumThread.findMany({
      where: {
        leagueId: league.id
      },
      include: {
        matchup: {
          select: {
            teamAName: true,
            teamBName: true
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' }, // Pinned threads first
        { updatedAt: 'desc' }  // Most recently updated
      ]
    })
    
    return NextResponse.json({
      threads
    })
    
  } catch (error) {
    console.error('Error fetching forum threads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
